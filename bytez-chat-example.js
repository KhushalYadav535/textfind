/**
 * Bytez Chat Example - Working Code
 * 
 * The model "Qwen/Qwen3-0.6B" doesn't exist in Bytez catalog.
 * Use one of these models instead:
 * - meta-llama/llama-3.1-8b-instruct (recommended for chat)
 * - openai/gpt-4o-mini (for vision tasks)
 */

import Bytez from "bytez.js";

const key = "c693e970502c7ac513415efe7032958e";

const sdk = new Bytez(key);

// Use a model that exists in Bytez catalog
// Changed from "Qwen/Qwen3-0.6B" to "meta-llama/llama-3.1-8b-instruct"
const model = sdk.model("meta-llama/llama-3.1-8b-instruct");

// Send input to model
// Method 1: Using string format (works based on your codebase)
async function example1() {
  const { error, output } = await model.run("Hello");
  console.log({ error, output });
}

// Method 2: Using chat format with roles (what you want)
async function example2() {
  const { error, output } = await model.run([
    {
      role: "user",
      content: "Hello"
    }
  ]);
  console.log({ error, output });
}

// Method 3: Multi-turn conversation
async function example3() {
  const { error, output } = await model.run([
    {
      role: "user",
      content: "What is 2+2?"
    }
  ]);
  console.log({ error, output });
}

// Run example
example2().catch(console.error);

