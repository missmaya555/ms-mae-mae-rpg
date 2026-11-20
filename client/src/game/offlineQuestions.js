/**
 * Offline fallback questions, used only when the server can't be reached.
 * Generated from server/data/numberJungleQuestions.js (the first question
 * at each difficulty level). Regenerate if the server bank changes.
 */

export const OFFLINE_QUESTIONS = {
  "6-8": [
    {
      "id": "68-1a",
      "topic": "Ratios & scale",
      "creature": "lumacaw",
      "prompt": "A trail map uses a scale of 1 cm : 5 km. Two camps are 4 cm apart on the map. How far apart are they in real life?",
      "choices": [
        {
          "label": "9 km",
          "isCorrect": false
        },
        {
          "label": "15 km",
          "isCorrect": false
        },
        {
          "label": "20 km",
          "isCorrect": true
        },
        {
          "label": "25 km",
          "isCorrect": false
        }
      ],
      "steps": [
        "Every 1 cm on the map stands for 5 km in the jungle.",
        "The camps are 4 cm apart, so we need four groups of 5 km: 4 × 5.",
        "4 × 5 = 20 km. Give it another shot."
      ],
      "difficulty": 1
    },
    {
      "id": "68-2a",
      "topic": "Percents",
      "creature": "coilvine",
      "prompt": "A canopy bridge is 240 m long. You have crossed 25% of it. How many meters have you crossed?",
      "choices": [
        {
          "label": "24 m",
          "isCorrect": false
        },
        {
          "label": "48 m",
          "isCorrect": false
        },
        {
          "label": "60 m",
          "isCorrect": true
        },
        {
          "label": "96 m",
          "isCorrect": false
        }
      ],
      "steps": [
        "25% means 25 out of 100, which is the same as one quarter.",
        "One quarter of 240 is 240 ÷ 4.",
        "240 ÷ 4 = 60 m. Try again."
      ],
      "difficulty": 2
    },
    {
      "id": "68-3a",
      "topic": "One-step equations",
      "creature": "coilvine",
      "prompt": "Solve for x: x + 14 = 9",
      "choices": [
        {
          "label": "x = −23",
          "isCorrect": false
        },
        {
          "label": "x = −5",
          "isCorrect": true
        },
        {
          "label": "x = 5",
          "isCorrect": false
        },
        {
          "label": "x = 23",
          "isCorrect": false
        }
      ],
      "steps": [
        "To get x alone, undo the \"+ 14\" by subtracting 14 from both sides.",
        "x = 9 − 14.",
        "9 − 14 = −5, so x = −5. Check it: −5 + 14 = 9. ✔"
      ],
      "difficulty": 3
    },
    {
      "id": "68-4a",
      "topic": "Variables on both sides",
      "creature": "glimmertoad",
      "prompt": "Solve for x: 5x + 3 = 2x + 18",
      "choices": [
        {
          "label": "x = 3",
          "isCorrect": false
        },
        {
          "label": "x = 5",
          "isCorrect": true
        },
        {
          "label": "x = 7",
          "isCorrect": false
        },
        {
          "label": "x = 15",
          "isCorrect": false
        }
      ],
      "steps": [
        "Get all the x terms on one side: subtract 2x from both sides. 3x + 3 = 18.",
        "Subtract 3 from both sides: 3x = 15.",
        "Divide by 3: x = 5. Check: 5(5) + 3 = 28 and 2(5) + 18 = 28. ✔"
      ],
      "difficulty": 4
    },
    {
      "id": "68-5a",
      "topic": "Writing linear equations",
      "creature": "lumacaw",
      "prompt": "A raft rental costs $12 plus $3 per hour. Which equation gives the cost C for h hours?",
      "choices": [
        {
          "label": "C = 12h + 3",
          "isCorrect": false
        },
        {
          "label": "C = 3h + 12",
          "isCorrect": true
        },
        {
          "label": "C = 15h",
          "isCorrect": false
        },
        {
          "label": "C = 3(h + 12)",
          "isCorrect": false
        }
      ],
      "steps": [
        "The $3 is charged for every hour, so it is multiplied by h: 3h.",
        "The $12 is charged once, no matter how long you ride. It is a fixed amount you add on.",
        "So C = 3h + 12. Try it again."
      ],
      "difficulty": 5
    }
  ],
  "9-12": [
    {
      "id": "912-1a",
      "topic": "Simplifying expressions",
      "creature": "fernpaw",
      "prompt": "Simplify: 3x + 5x − 2",
      "choices": [
        {
          "label": "6x",
          "isCorrect": false
        },
        {
          "label": "8x − 2",
          "isCorrect": true
        },
        {
          "label": "8x + 2",
          "isCorrect": false
        },
        {
          "label": "15x − 2",
          "isCorrect": false
        }
      ],
      "steps": [
        "Combine like terms: 3x and 5x are both \"x\" terms.",
        "3x + 5x = 8x. The −2 has no x, so it stays as it is.",
        "Result: 8x − 2. Try again."
      ],
      "difficulty": 1
    },
    {
      "id": "912-2a",
      "topic": "Slope-intercept form",
      "creature": "coilvine",
      "prompt": "What is the y-intercept of y = −3x + 8?",
      "choices": [
        {
          "label": "−8",
          "isCorrect": false
        },
        {
          "label": "−3",
          "isCorrect": false
        },
        {
          "label": "3",
          "isCorrect": false
        },
        {
          "label": "8",
          "isCorrect": true
        }
      ],
      "steps": [
        "Slope-intercept form is y = mx + b, where b is the y-intercept.",
        "Match it up: m = −3 is the slope, and b = 8.",
        "The y-intercept is 8. That is where the line crosses the y-axis."
      ],
      "difficulty": 2
    },
    {
      "id": "912-3a",
      "topic": "Quadratic equations",
      "creature": "glimmertoad",
      "prompt": "Solve: x² − 9 = 0",
      "choices": [
        {
          "label": "x = 3 only",
          "isCorrect": false
        },
        {
          "label": "x = 3 or x = −3",
          "isCorrect": true
        },
        {
          "label": "x = 9",
          "isCorrect": false
        },
        {
          "label": "x = 9 or x = −9",
          "isCorrect": false
        }
      ],
      "steps": [
        "Add 9 to both sides: x² = 9.",
        "Which numbers squared give 9? Both 3² and (−3)² equal 9.",
        "So x = 3 or x = −3. Don't forget the negative one!"
      ],
      "difficulty": 3
    },
    {
      "id": "912-4a",
      "topic": "Solving quadratics by factoring",
      "creature": "lumacaw",
      "prompt": "Solve: x² − 5x + 6 = 0",
      "choices": [
        {
          "label": "x = −2 or x = −3",
          "isCorrect": false
        },
        {
          "label": "x = 1 or x = 6",
          "isCorrect": false
        },
        {
          "label": "x = 2 or x = 3",
          "isCorrect": true
        },
        {
          "label": "x = −1 or x = 6",
          "isCorrect": false
        }
      ],
      "steps": [
        "Find two numbers that multiply to 6 and add to −5. Those are −2 and −3.",
        "Factor: (x − 2)(x − 3) = 0.",
        "Set each factor to 0: x = 2 or x = 3."
      ],
      "difficulty": 4
    },
    {
      "id": "912-5a",
      "topic": "Systems of equations",
      "creature": "fernpaw",
      "prompt": "Solve the system: y = 2x + 1 and y = −x + 7",
      "choices": [
        {
          "label": "(1, 3)",
          "isCorrect": false
        },
        {
          "label": "(2, 5)",
          "isCorrect": true
        },
        {
          "label": "(3, 7)",
          "isCorrect": false
        },
        {
          "label": "(5, 2)",
          "isCorrect": false
        }
      ],
      "steps": [
        "Both equations equal y, so set them equal to each other: 2x + 1 = −x + 7.",
        "Add x to both sides and subtract 1: 3x = 6, so x = 2.",
        "Plug in: y = 2(2) + 1 = 5. The solution is (2, 5)."
      ],
      "difficulty": 5
    }
  ]
};
