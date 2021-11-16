export type Transition = {
  sy: number;
  ey: number;
  run: number;
  amplitude?: number;
  fadeIn: boolean;
  fadeOut: boolean;
} | {
  sy: 0;
  ey?: number;
  run: number;
  amplitude?: number;
  fadeIn?: boolean;
  fadeOut?: boolean;
}