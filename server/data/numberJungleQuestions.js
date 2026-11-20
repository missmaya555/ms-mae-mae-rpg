/**
 * Number Jungle question bank — grades 6–12.
 *
 * Two grade bands, each with difficulty 1 (easiest) to 5 (hardest):
 *   '6-8'  — ratios, percents, integers, one- and two-step equations,
 *            slope, systems, Pythagorean theorem
 *   '9-12' — algebra I/II: expressions, inequalities, factoring,
 *            quadratics, exponents, logs, exponential models
 *
 * Every question has `steps`: Ms. Mae-Mae's walkthrough, shown when a
 * student answers incorrectly, before they try again.
 * `creature` is the jungle creature that appears with the question.
 */

const QUESTION_BANK = {
  '6-8': {
    1: [
      {
        id: '68-1a',
        topic: 'Ratios & scale',
        creature: 'lumacaw',
        prompt: 'A trail map uses a scale of 1 cm : 5 km. Two camps are 4 cm apart on the map. How far apart are they in real life?',
        choices: [
          { label: '9 km', isCorrect: false },
          { label: '15 km', isCorrect: false },
          { label: '20 km', isCorrect: true },
          { label: '25 km', isCorrect: false },
        ],
        steps: [
          'Every 1 cm on the map stands for 5 km in the jungle.',
          'The camps are 4 cm apart, so we need four groups of 5 km: 4 × 5.',
          '4 × 5 = 20 km. Give it another shot.',
        ],
      },
      {
        id: '68-1b',
        topic: 'Integers',
        creature: 'glimmertoad',
        prompt: 'The river temperature starts at −7°C and rises 12 degrees. What is the new temperature?',
        choices: [
          { label: '−19°C', isCorrect: false },
          { label: '−5°C', isCorrect: false },
          { label: '5°C', isCorrect: true },
          { label: '19°C', isCorrect: false },
        ],
        steps: [
          'Picture a number line. You start at −7.',
          'Rising 7 degrees gets you to 0. You still have 12 − 7 = 5 degrees to go.',
          'So −7 + 12 = 5. Try it again.',
        ],
      },
      {
        id: '68-1c',
        topic: 'Ratios',
        creature: 'lumacaw',
        prompt: 'A flock has 3 red parrots for every 5 green parrots. If there are 15 green parrots, how many red parrots are there?',
        choices: [
          { label: '5', isCorrect: false },
          { label: '8', isCorrect: false },
          { label: '9', isCorrect: true },
          { label: '25', isCorrect: false },
        ],
        steps: [
          'The ratio is red : green = 3 : 5.',
          'Green went from 5 to 15. That is 3 times bigger, so red must also be 3 times bigger.',
          '3 × 3 = 9 red parrots. You have this.',
        ],
      },
    ],
    2: [
      {
        id: '68-2a',
        topic: 'Percents',
        creature: 'coilvine',
        prompt: 'A canopy bridge is 240 m long. You have crossed 25% of it. How many meters have you crossed?',
        choices: [
          { label: '24 m', isCorrect: false },
          { label: '48 m', isCorrect: false },
          { label: '60 m', isCorrect: true },
          { label: '96 m', isCorrect: false },
        ],
        steps: [
          '25% means 25 out of 100, which is the same as one quarter.',
          'One quarter of 240 is 240 ÷ 4.',
          '240 ÷ 4 = 60 m. Try again.',
        ],
      },
      {
        id: '68-2b',
        topic: 'Unit rates',
        creature: 'fernpaw',
        prompt: 'A sloth climbs 18 m in 6 minutes. What is its rate in meters per minute?',
        choices: [
          { label: '3 m/min', isCorrect: true },
          { label: '12 m/min', isCorrect: false },
          { label: '24 m/min', isCorrect: false },
          { label: '108 m/min', isCorrect: false },
        ],
        steps: [
          '"Per minute" means we want how far it climbs in just 1 minute.',
          'Split the 18 m evenly across the 6 minutes: 18 ÷ 6.',
          '18 ÷ 6 = 3 m per minute. Give it another try.',
        ],
      },
      {
        id: '68-2c',
        topic: 'Integers',
        creature: 'glimmertoad',
        prompt: 'What is −3 × (−8)?',
        choices: [
          { label: '−24', isCorrect: false },
          { label: '−11', isCorrect: false },
          { label: '11', isCorrect: false },
          { label: '24', isCorrect: true },
        ],
        steps: [
          'First multiply the numbers without signs: 3 × 8 = 24.',
          'Now the signs: negative × negative gives a positive.',
          'So −3 × (−8) = 24. Try it again.',
        ],
      },
    ],
    3: [
      {
        id: '68-3a',
        topic: 'One-step equations',
        creature: 'coilvine',
        prompt: 'Solve for x: x + 14 = 9',
        choices: [
          { label: 'x = −23', isCorrect: false },
          { label: 'x = −5', isCorrect: true },
          { label: 'x = 5', isCorrect: false },
          { label: 'x = 23', isCorrect: false },
        ],
        steps: [
          'To get x alone, undo the "+ 14" by subtracting 14 from both sides.',
          'x = 9 − 14.',
          '9 − 14 = −5, so x = −5. Check it: −5 + 14 = 9. ✔',
        ],
      },
      {
        id: '68-3b',
        topic: 'Two-step equations',
        creature: 'fernpaw',
        prompt: 'Solve for x: 3x − 7 = 20',
        choices: [
          { label: 'x = 4', isCorrect: false },
          { label: 'x = 6', isCorrect: false },
          { label: 'x = 9', isCorrect: true },
          { label: 'x = 27', isCorrect: false },
        ],
        steps: [
          'Undo the subtraction first: add 7 to both sides. 3x = 27.',
          'Now undo the multiplication: divide both sides by 3.',
          '27 ÷ 3 = 9, so x = 9. Check: 3(9) − 7 = 20. ✔',
        ],
      },
      {
        id: '68-3c',
        topic: 'One-step equations',
        creature: 'lumacaw',
        prompt: 'Solve for x: x ÷ 4 = 6',
        choices: [
          { label: 'x = 1.5', isCorrect: false },
          { label: 'x = 2', isCorrect: false },
          { label: 'x = 10', isCorrect: false },
          { label: 'x = 24', isCorrect: true },
        ],
        steps: [
          'x is being divided by 4. The opposite of dividing is multiplying.',
          'Multiply both sides by 4: x = 6 × 4.',
          'x = 24. Check: 24 ÷ 4 = 6. ✔',
        ],
      },
    ],
    4: [
      {
        id: '68-4a',
        topic: 'Variables on both sides',
        creature: 'glimmertoad',
        prompt: 'Solve for x: 5x + 3 = 2x + 18',
        choices: [
          { label: 'x = 3', isCorrect: false },
          { label: 'x = 5', isCorrect: true },
          { label: 'x = 7', isCorrect: false },
          { label: 'x = 15', isCorrect: false },
        ],
        steps: [
          'Get all the x terms on one side: subtract 2x from both sides. 3x + 3 = 18.',
          'Subtract 3 from both sides: 3x = 15.',
          'Divide by 3: x = 5. Check: 5(5) + 3 = 28 and 2(5) + 18 = 28. ✔',
        ],
      },
      {
        id: '68-4b',
        topic: 'Slope',
        creature: 'coilvine',
        prompt: 'What is the slope of the line through (2, 3) and (6, 11)?',
        choices: [
          { label: '1/2', isCorrect: false },
          { label: '2', isCorrect: true },
          { label: '4', isCorrect: false },
          { label: '8', isCorrect: false },
        ],
        steps: [
          'Slope = rise ÷ run = (change in y) ÷ (change in x).',
          'Rise: 11 − 3 = 8. Run: 6 − 2 = 4.',
          '8 ÷ 4 = 2. Try again.',
        ],
      },
      {
        id: '68-4c',
        topic: 'Distributive property',
        creature: 'fernpaw',
        prompt: 'Solve for x: 2(x − 4) = 10',
        choices: [
          { label: 'x = 1', isCorrect: false },
          { label: 'x = 3', isCorrect: false },
          { label: 'x = 7', isCorrect: false },
          { label: 'x = 9', isCorrect: true },
        ],
        steps: [
          'Distribute the 2: 2x − 8 = 10.',
          'Add 8 to both sides: 2x = 18.',
          'Divide by 2: x = 9. Check: 2(9 − 4) = 10. ✔',
        ],
      },
    ],
    5: [
      {
        id: '68-5a',
        topic: 'Writing linear equations',
        creature: 'lumacaw',
        prompt: 'A raft rental costs $12 plus $3 per hour. Which equation gives the cost C for h hours?',
        choices: [
          { label: 'C = 12h + 3', isCorrect: false },
          { label: 'C = 3h + 12', isCorrect: true },
          { label: 'C = 15h', isCorrect: false },
          { label: 'C = 3(h + 12)', isCorrect: false },
        ],
        steps: [
          'The $3 is charged for every hour, so it is multiplied by h: 3h.',
          'The $12 is charged once, no matter how long you ride. It is a fixed amount you add on.',
          'So C = 3h + 12. Try it again.',
        ],
      },
      {
        id: '68-5b',
        topic: 'Systems of equations',
        creature: 'glimmertoad',
        prompt: 'x + y = 10 and x − y = 4. What is x?',
        choices: [
          { label: '3', isCorrect: false },
          { label: '6', isCorrect: false },
          { label: '7', isCorrect: true },
          { label: '14', isCorrect: false },
        ],
        steps: [
          'Add the two equations together. The y terms cancel: (x + y) + (x − y) = 10 + 4.',
          'That gives 2x = 14.',
          'So x = 7 (and y = 3). Give it another try.',
        ],
      },
      {
        id: '68-5c',
        topic: 'Pythagorean theorem',
        creature: 'coilvine',
        prompt: 'A right triangle has legs of 6 m and 8 m. How long is the hypotenuse?',
        choices: [
          { label: '7 m', isCorrect: false },
          { label: '10 m', isCorrect: true },
          { label: '12 m', isCorrect: false },
          { label: '14 m', isCorrect: false },
        ],
        steps: [
          'Use a² + b² = c², where c is the hypotenuse.',
          '6² + 8² = 36 + 64 = 100.',
          'c = √100 = 10 m. Try it again.',
        ],
      },
    ],
  },

  '9-12': {
    1: [
      {
        id: '912-1a',
        topic: 'Simplifying expressions',
        creature: 'fernpaw',
        prompt: 'Simplify: 3x + 5x − 2',
        choices: [
          { label: '6x', isCorrect: false },
          { label: '8x − 2', isCorrect: true },
          { label: '8x + 2', isCorrect: false },
          { label: '15x − 2', isCorrect: false },
        ],
        steps: [
          'Combine like terms: 3x and 5x are both "x" terms.',
          '3x + 5x = 8x. The −2 has no x, so it stays as it is.',
          'Result: 8x − 2. Try again.',
        ],
      },
      {
        id: '912-1b',
        topic: 'Function evaluation',
        creature: 'lumacaw',
        prompt: 'If f(x) = 2x² − 3, what is f(4)?',
        choices: [
          { label: '5', isCorrect: false },
          { label: '13', isCorrect: false },
          { label: '29', isCorrect: true },
          { label: '61', isCorrect: false },
        ],
        steps: [
          'Replace x with 4: f(4) = 2(4)² − 3.',
          'Exponent first: 4² = 16. Then 2 × 16 = 32.',
          '32 − 3 = 29. Give it another shot.',
        ],
      },
      {
        id: '912-1c',
        topic: 'Linear equations',
        creature: 'glimmertoad',
        prompt: 'Solve for x: −4x + 7 = −13',
        choices: [
          { label: 'x = −5', isCorrect: false },
          { label: 'x = −1.5', isCorrect: false },
          { label: 'x = 1.5', isCorrect: false },
          { label: 'x = 5', isCorrect: true },
        ],
        steps: [
          'Subtract 7 from both sides: −4x = −20.',
          'Divide both sides by −4. Watch the signs: a negative divided by a negative is positive.',
          'x = 5. Check: −4(5) + 7 = −13. ✔',
        ],
      },
    ],
    2: [
      {
        id: '912-2a',
        topic: 'Slope-intercept form',
        creature: 'coilvine',
        prompt: 'What is the y-intercept of y = −3x + 8?',
        choices: [
          { label: '−8', isCorrect: false },
          { label: '−3', isCorrect: false },
          { label: '3', isCorrect: false },
          { label: '8', isCorrect: true },
        ],
        steps: [
          'Slope-intercept form is y = mx + b, where b is the y-intercept.',
          'Match it up: m = −3 is the slope, and b = 8.',
          'The y-intercept is 8. That is where the line crosses the y-axis.',
        ],
      },
      {
        id: '912-2b',
        topic: 'Inequalities',
        creature: 'fernpaw',
        prompt: 'Solve: 2x − 5 > 9',
        choices: [
          { label: 'x > 2', isCorrect: false },
          { label: 'x > 7', isCorrect: true },
          { label: 'x < 7', isCorrect: false },
          { label: 'x > 14', isCorrect: false },
        ],
        steps: [
          'Solve it like an equation. Add 5 to both sides: 2x > 14.',
          'Divide by 2. Because 2 is positive, the inequality sign does not flip.',
          'x > 7. Try again.',
        ],
      },
      {
        id: '912-2c',
        topic: 'Factoring',
        creature: 'lumacaw',
        prompt: 'Factor: x² + 7x + 12',
        choices: [
          { label: '(x + 2)(x + 6)', isCorrect: false },
          { label: '(x + 3)(x + 4)', isCorrect: true },
          { label: '(x + 1)(x + 12)', isCorrect: false },
          { label: '(x − 3)(x − 4)', isCorrect: false },
        ],
        steps: [
          'Find two numbers that multiply to 12 and add to 7.',
          'Check pairs: 1 & 12 add to 13, 2 & 6 add to 8, and 3 & 4 add to 7. ✔',
          'So x² + 7x + 12 = (x + 3)(x + 4).',
        ],
      },
    ],
    3: [
      {
        id: '912-3a',
        topic: 'Quadratic equations',
        creature: 'glimmertoad',
        prompt: 'Solve: x² − 9 = 0',
        choices: [
          { label: 'x = 3 only', isCorrect: false },
          { label: 'x = 3 or x = −3', isCorrect: true },
          { label: 'x = 9', isCorrect: false },
          { label: 'x = 9 or x = −9', isCorrect: false },
        ],
        steps: [
          'Add 9 to both sides: x² = 9.',
          'Which numbers squared give 9? Both 3² and (−3)² equal 9.',
          'So x = 3 or x = −3. Don\'t forget the negative one!',
        ],
      },
      {
        id: '912-3b',
        topic: 'Exponent rules',
        creature: 'coilvine',
        prompt: 'Simplify: (2x³)(5x⁴)',
        choices: [
          { label: '7x⁷', isCorrect: false },
          { label: '10x', isCorrect: false },
          { label: '10x⁷', isCorrect: true },
          { label: '10x¹²', isCorrect: false },
        ],
        steps: [
          'Multiply the numbers: 2 × 5 = 10.',
          'Same base, so add the exponents: x³ · x⁴ = x³⁺⁴.',
          'Result: 10x⁷. Try again.',
        ],
      },
      {
        id: '912-3c',
        topic: 'Equations of lines',
        creature: 'fernpaw',
        prompt: 'A line has slope 4 and passes through (0, −2). What is its equation?',
        choices: [
          { label: 'y = 4x − 2', isCorrect: true },
          { label: 'y = 4x + 2', isCorrect: false },
          { label: 'y = −2x + 4', isCorrect: false },
          { label: 'y = −4x − 2', isCorrect: false },
        ],
        steps: [
          'Use y = mx + b. The slope m is 4.',
          'The point (0, −2) is on the y-axis, so it is the y-intercept: b = −2.',
          'y = 4x − 2. Give it another shot.',
        ],
      },
    ],
    4: [
      {
        id: '912-4a',
        topic: 'Solving quadratics by factoring',
        creature: 'lumacaw',
        prompt: 'Solve: x² − 5x + 6 = 0',
        choices: [
          { label: 'x = −2 or x = −3', isCorrect: false },
          { label: 'x = 1 or x = 6', isCorrect: false },
          { label: 'x = 2 or x = 3', isCorrect: true },
          { label: 'x = −1 or x = 6', isCorrect: false },
        ],
        steps: [
          'Find two numbers that multiply to 6 and add to −5. Those are −2 and −3.',
          'Factor: (x − 2)(x − 3) = 0.',
          'Set each factor to 0: x = 2 or x = 3.',
        ],
      },
      {
        id: '912-4b',
        topic: 'Vertex form',
        creature: 'glimmertoad',
        prompt: 'What is the vertex of y = (x − 3)² + 4?',
        choices: [
          { label: '(−3, 4)', isCorrect: false },
          { label: '(3, −4)', isCorrect: false },
          { label: '(3, 4)', isCorrect: true },
          { label: '(4, 3)', isCorrect: false },
        ],
        steps: [
          'Vertex form is y = (x − h)² + k, and the vertex is (h, k).',
          'Here, (x − 3) means h = 3. Notice the sign flips from what you see.',
          'k = 4, so the vertex is (3, 4).',
        ],
      },
      {
        id: '912-4c',
        topic: 'Exponential equations',
        creature: 'coilvine',
        prompt: 'Solve: 2ˣ = 32',
        choices: [
          { label: 'x = 4', isCorrect: false },
          { label: 'x = 5', isCorrect: true },
          { label: 'x = 6', isCorrect: false },
          { label: 'x = 16', isCorrect: false },
        ],
        steps: [
          'Ask yourself: how many 2s do I multiply together to get 32?',
          '2 × 2 × 2 × 2 × 2 = 32. That is five 2s.',
          'So 2⁵ = 32, and x = 5.',
        ],
      },
    ],
    5: [
      {
        id: '912-5a',
        topic: 'Systems of equations',
        creature: 'fernpaw',
        prompt: 'Solve the system: y = 2x + 1 and y = −x + 7',
        choices: [
          { label: '(1, 3)', isCorrect: false },
          { label: '(2, 5)', isCorrect: true },
          { label: '(3, 7)', isCorrect: false },
          { label: '(5, 2)', isCorrect: false },
        ],
        steps: [
          'Both equations equal y, so set them equal to each other: 2x + 1 = −x + 7.',
          'Add x to both sides and subtract 1: 3x = 6, so x = 2.',
          'Plug in: y = 2(2) + 1 = 5. The solution is (2, 5).',
        ],
      },
      {
        id: '912-5b',
        topic: 'Logarithms',
        creature: 'lumacaw',
        prompt: 'Evaluate: log₃(81)',
        choices: [
          { label: '3', isCorrect: false },
          { label: '4', isCorrect: true },
          { label: '9', isCorrect: false },
          { label: '27', isCorrect: false },
        ],
        steps: [
          'log₃(81) asks: "3 to what power equals 81?"',
          '3¹ = 3, 3² = 9, 3³ = 27, 3⁴ = 81.',
          'So log₃(81) = 4.',
        ],
      },
      {
        id: '912-5c',
        topic: 'Exponential growth',
        creature: 'glimmertoad',
        prompt: 'A jaguar population of 200 grows by 10% each year. Which model gives the population P after t years?',
        choices: [
          { label: 'P = 200 + 10t', isCorrect: false },
          { label: 'P = 200(0.1)ᵗ', isCorrect: false },
          { label: 'P = 200(1.1)ᵗ', isCorrect: true },
          { label: 'P = 200(1.1t)', isCorrect: false },
        ],
        steps: [
          'Growing by 10% means each year you keep 100% and add 10%, so you multiply by 1.10.',
          'That multiplication happens again every year, which is why t is an exponent.',
          'P = 200(1.1)ᵗ. Try it again.',
        ],
      },
    ],
  },
};

const GRADE_BANDS = Object.keys(QUESTION_BANK);

module.exports = { QUESTION_BANK, GRADE_BANDS };
