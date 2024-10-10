
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { ErrorTxt } from 'src/constants/error.txt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if(!token) {
      throw new UnauthorizedException()
    }

    try {
      const payload = this.jwtService.verify(token);
      request.userId = payload?.userId;
    } catch (error) {
      throw new UnauthorizedException(ErrorTxt.InvalidToken)
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): undefined | string {
    return request.headers.authorization?.split(' ')[1]
  }
}
