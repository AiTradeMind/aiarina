import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { UserRepository, MembershipRepository } from "../repositories/index.ts";
import { UserSession, RoleType, JWTPayload } from "../types/index.ts";
import { config } from "../../../infrastructure/config/env.ts";

export class AuthService {
  private userRepo = new UserRepository();
  private membershipRepo = new MembershipRepository();

  async login(email: string, password?: string): Promise<UserSession> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const settings = (user.settings || {}) as Record<string, any>;
    let passwordHash = settings.passwordHash;

    if (!passwordHash) {
      throw new Error("Invalid email or password");
    } else if (!password || !bcryptjs.compareSync(password, passwordHash)) {
      throw new Error("Invalid email or password");
    }

    const payload: JWTPayload = { userId: user.id, email: user.email, role: user.role as RoleType };
    const accessToken = jwt.sign(payload, config.JWT_ACCESS_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId: user.id }, config.JWT_REFRESH_SECRET, { expiresIn: "7d" });

    settings.refreshToken = refreshToken;
    await this.userRepo.update(user.id, undefined, undefined, settings);

    return { accessToken, refreshToken, userId: user.id, email: user.email, role: user.role as RoleType, expiresIn: 900 };
  }

  async logout(accessToken: string): Promise<boolean> {
    const decoded = jwt.decode(accessToken) as JWTPayload;
    if (!decoded?.userId) return false;
    const user = await this.userRepo.findById(decoded.userId);
    if (!user) return false;
    const settings = (user.settings || {}) as Record<string, any>;
    delete settings.refreshToken;
    await this.userRepo.update(user.id, undefined, undefined, settings);
    return true;
  }

  async refresh(refreshToken: string): Promise<UserSession> {
    const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as { userId: number };
    const user = await this.userRepo.findById(decoded.userId);
    if (!user) throw new Error("User not found");
    const settings = (user.settings || {}) as Record<string, any>;
    if (settings.refreshToken !== refreshToken) throw new Error("Session revoked");

    const payload: JWTPayload = { userId: user.id, email: user.email, role: user.role as RoleType };
    const newAccessToken = jwt.sign(payload, config.JWT_ACCESS_SECRET, { expiresIn: "15m" });
    const newRefreshToken = jwt.sign({ userId: user.id }, config.JWT_REFRESH_SECRET, { expiresIn: "7d" });

    settings.refreshToken = newRefreshToken;
    await this.userRepo.update(user.id, undefined, undefined, settings);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken, userId: user.id, email: user.email, role: user.role as RoleType, expiresIn: 900 };
  }

  async verifySession(accessToken: string) {
    const decoded = jwt.verify(accessToken, config.JWT_ACCESS_SECRET) as JWTPayload;
    const user = await this.userRepo.findById(decoded.userId);
    if (!user) throw new Error("User not found");
    const memberships = await this.membershipRepo.getMembershipsForUser(user.id);
    return { session: { userId: user.id, email: user.email, role: user.role as RoleType }, user, memberships };
  }
}
