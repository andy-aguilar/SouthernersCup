import { catalog } from "./catalog";

export const CATALOG_VERSION = "2026-08-05.generic-blocks.v1";

type CatalogComponent =
  (typeof catalog.data.components)[keyof typeof catalog.data.components];

const components = catalog.data.components as Record<string, CatalogComponent>;

export function getAgentCatalog() {
  return {
    version: CATALOG_VERSION,
    generatedAt: new Date().toISOString(),
    components: Object.fromEntries(
      Object.entries(components).map(([name, component]) => [
        name,
        {
          description: component.description,
          propsSchema: component.props.toJSONSchema(),
        },
      ]),
    ),
    actions: {},
  };
}

export function validateRenderSpec(spec: unknown) {
  const errors: string[] = [];

  if (!spec || typeof spec !== "object" || Array.isArray(spec)) {
    return { success: false, errors: ["spec must be an object"] };
  }

  const candidate = spec as {
    root?: unknown;
    elements?: unknown;
  };

  if (typeof candidate.root !== "string" || !candidate.root) {
    errors.push("spec.root must be a non-empty string");
  }

  if (
    !candidate.elements ||
    typeof candidate.elements !== "object" ||
    Array.isArray(candidate.elements)
  ) {
    errors.push("spec.elements must be an object");
    return { success: false, errors };
  }

  const elements = candidate.elements as Record<string, unknown>;
  if (typeof candidate.root === "string" && !elements[candidate.root]) {
    errors.push(`spec.root references missing element "${candidate.root}"`);
  }

  for (const [elementId, element] of Object.entries(elements)) {
    if (!element || typeof element !== "object" || Array.isArray(element)) {
      errors.push(`elements.${elementId} must be an object`);
      continue;
    }

    const block = element as {
      type?: unknown;
      props?: unknown;
      children?: unknown;
    };

    if (typeof block.type !== "string") {
      errors.push(`elements.${elementId}.type must be a string`);
      continue;
    }

    const component = components[block.type];
    if (!component) {
      errors.push(`elements.${elementId}.type "${block.type}" is not in the catalog`);
      continue;
    }

    const propsResult = component.props.safeParse(block.props ?? {});
    if (!propsResult.success) {
      errors.push(
        `elements.${elementId}.props invalid: ${propsResult.error.issues
          .map(
            (issue: { path: PropertyKey[]; message: string }) =>
              `${issue.path.join(".") || "props"} ${issue.message}`,
          )
          .join("; ")}`,
      );
    }

    if (block.children !== undefined) {
      if (!Array.isArray(block.children)) {
        errors.push(`elements.${elementId}.children must be an array of element ids`);
      } else {
        for (const child of block.children) {
          if (typeof child !== "string") {
            errors.push(`elements.${elementId}.children contains a non-string child`);
          } else if (!elements[child]) {
            errors.push(
              `elements.${elementId}.children references missing element "${child}"`,
            );
          }
        }
      }
    }
  }

  return errors.length ? { success: false, errors } : { success: true, errors: [] };
}
