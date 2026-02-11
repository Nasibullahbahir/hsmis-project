import { toJalaali } from "jalaali-js";

const gregorianToShamsi = (value) => {
  if (!value) return "";

  const datePart = value.split("T")[0];
  const parts = datePart.split("-").map(Number);

  if (parts.length !== 3) return "";

  const [gy, gm, gd] = parts;
  if (!gy || !gm || !gd) return "";

  const j = toJalaali(gy, gm, gd);

  return `${j.jy}-${String(j.jm).padStart(2, "0")}-${String(j.jd).padStart(2, "0")}`;
};

export default gregorianToShamsi;
