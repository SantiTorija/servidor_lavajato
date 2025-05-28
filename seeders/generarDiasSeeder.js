const { Day } = require("../models");

async function seeder() {
  try {
    // Generate future days
    const today = new Date();
    const monthsAhead = 2; // Generate 2 months ahead

    for (let i = 0; i < monthsAhead; i++) {
      const targetMonth = today.getMonth() + i + 1;
      const year = today.getFullYear() + Math.floor(targetMonth / 12);
      const month = targetMonth % 12;

      const daysInMonth = new Date(year, month + 1, 0).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);

        // Skip weekends (optional)
        if (date.getDay() % 6 === 0) continue;

        await Day.findOrCreate({
          where: { date },
          defaults: {
            slots_available: [],
          },
        });
      }
    }

    console.log("Future days generated successfully.");
  } catch (error) {
    console.error("Error in seeder:", error);
  }
}

module.exports = seeder;
