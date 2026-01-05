/**
 * Simple Bytez Chat Test
 * Run this file to test Bytez chat functionality
 * 
 * Usage: node test-bytez-chat.js
 */

import Bytez from "bytez.js";

const key = "c693e970502c7ac513415efe7032958e";

const sdk = new Bytez(key);

// Use a model that exists in Bytez catalog
// meta-llama/llama-3.1-8b-instruct is already used in your codebase
const model = sdk.model("meta-llama/llama-3.1-8b-instruct");

// Test chat function
async function testChat() {
  console.log("Testing Bytez chat...\n");

  try {
    // Method 1: Simple string prompt (this format works based on your codebase)
    console.log("Method 1: Using string prompt");
    const { error: error1, output: output1 } = await model.run("Hello, how are you?");
    console.log({ error: error1, output: output1 });
    console.log("\n");

    // Method 2: Chat format with roles (what you want to use)
    console.log("Method 2: Using chat format with roles");
    const { error: error2, output: output2 } = await model.run([
      {
        role: "user",
        content: "Hello"
      }
    ]);
    console.log({ error: error2, output: output2 });
    console.log("\n");

    // Method 3: Multi-turn conversation
    console.log("Method 3: Multi-turn conversation");
    const { error: error3, output: output3 } = await model.run([
      {
        role: "user",
        content: "What is the capital of France?"
      }
    ]);
    console.log({ error: error3, output: output3 });

  } catch (error) {
    console.error("Error:", error);
  }
}

// Run the test
testChat();

