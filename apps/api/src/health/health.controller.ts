import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
  @Get()
  check(): { status: "ok"; uptimeSeconds: number } {
    return { status: "ok", uptimeSeconds: Math.floor(process.uptime()) };
  }
}
