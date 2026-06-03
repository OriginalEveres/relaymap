import { Controller, Get } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";

@SkipThrottle()
@Controller("health")
export class HealthController {
  @Get()
  check(): { status: "ok"; uptimeSeconds: number } {
    return { status: "ok", uptimeSeconds: Math.floor(process.uptime()) };
  }
}
