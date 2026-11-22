import { getRootItems } from "@/data/fs";
import Springboard from "./Springboard";

/** A static, navigable first paint. CSS chooses its phone or desktop layout before React runs. */
export default function HomeIntro() {
  return <Springboard items={getRootItems(false, false)} firstPaint />;
}
