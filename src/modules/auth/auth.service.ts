import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { User } from '../user/entities/user.entity';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const user = this.userRepository.create(registerDto);
    const savedUser = await this.userRepository.save(user);

    const tokens = await this.generateTokens(savedUser);
    
    return {
      user: this.sanitizeUser(savedUser),
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user || !(await user.validatePassword(loginDto.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }

  async validateUserByCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return null;
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    return user;
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET', 'refresh-secret'),
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user);
      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET', 'default-secret'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '7d'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET', 'refresh-secret'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '30d'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private sanitizeUser(user: User) {
    const { password, ...result } = user;
    return result;
  }

  async logout(userId: string) {
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });

    // Always return the same message to prevent user enumeration
    const successMsg = { message: 'If that email exists, a reset link has been sent.' };
    if (!user) return successMsg;

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetToken = resetToken;
    user.resetTokenExpires = resetTokenExpires;
    await this.userRepository.save(user);

    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:5173');
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    // Log to console in dev (wire up nodemailer/SMTP when ready)
    console.log(`[Password Reset] ${user.email} → ${resetUrl}`);

    return successMsg;
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { resetToken: dto.token },
    });

    if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    user.password = dto.newPassword; // BeforeUpdate hook will hash it
    user.resetToken = null;
    user.resetTokenExpires = null;
    await this.userRepository.save(user);

    return { message: 'Password reset successfully' };
  }
}

