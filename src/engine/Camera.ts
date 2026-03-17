/**
 * Camera / viewport manager. Tracks a world-space position and viewport size.
 * Can follow a target smoothly.
 */
export class Camera {
  x = 0;
  y = 0;
  viewportW = 800;
  viewportH = 600;

  // Optional follow target
  private targetX: number | null = null;
  private targetY: number | null = null;
  private smoothing = 0.1;

  setViewport(w: number, h: number) {
    this.viewportW = w;
    this.viewportH = h;
  }

  follow(x: number, y: number) {
    this.targetX = x;
    this.targetY = y;
  }

  stopFollowing() {
    this.targetX = null;
    this.targetY = null;
  }

  update() {
    if (this.targetX !== null && this.targetY !== null) {
      this.x += (this.targetX - this.x) * this.smoothing;
      this.y += (this.targetY - this.y) * this.smoothing;
    }
  }

  clampToWorld(worldW: number, worldH: number) {
    const halfViewportW = this.viewportW / 2;
    const halfViewportH = this.viewportH / 2;

    if (worldW <= this.viewportW) {
      this.x = worldW / 2;
    } else {
      this.x = Math.min(worldW - halfViewportW, Math.max(halfViewportW, this.x));
    }

    if (worldH <= this.viewportH) {
      this.y = worldH / 2;
    } else {
      this.y = Math.min(worldH - halfViewportH, Math.max(halfViewportH, this.y));
    }
  }

  /** Convert screen coordinates to world coordinates */
  screenToWorld(screenX: number, screenY: number) {
    return {
      x: screenX + this.x - this.viewportW / 2,
      y: screenY + this.y - this.viewportH / 2,
    };
  }

  /** Convert world coordinates to screen coordinates */
  worldToScreen(worldX: number, worldY: number) {
    return {
      x: worldX - this.x + this.viewportW / 2,
      y: worldY - this.y + this.viewportH / 2,
    };
  }
}
