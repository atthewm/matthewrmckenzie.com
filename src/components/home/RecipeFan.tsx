import Link from "next/link";
import { recipes } from "@/content/recipes/index";

// Three recipe cards from the recipe index (its existing order), fanned like
// cards on a counter. The fanned layout is the resting state in CSS; HomeMotion
// starts them as a stack and fans them out with scrub when motion is allowed.

const CARD_COUNT = 3;

export default function RecipeFan() {
  const cards = recipes.slice(0, CARD_COUNT);

  return (
    <ul className="fan" data-fan>
      {cards.map((recipe, i) => (
        <li key={recipe.slug} className="fan-card" data-fan-card style={{ zIndex: i + 1 }}>
          <Link href={`/recipes/${recipe.slug}`} className="fan-card-face">
            <span className="fan-card-top">
              <span>{recipe.category}</span>
              <span className="site-num">No. {String(i + 1).padStart(2, "0")}</span>
            </span>
            <span className="fan-card-title">{recipe.title}</span>
            <span className="fan-card-sub">{recipe.subtitle}</span>
            <span className="fan-card-meta site-num">{recipe.yield}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
