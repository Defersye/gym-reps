document.addEventListener("DOMContentLoaded", () => {
   const exerciseTitle = document.getElementById("exercise-title");
   const minusBtn = document.querySelector(".minus-btn");
   const plusBtn = document.querySelector(".plus-btn");
   const resetBtn = document.querySelector(".reset-btn");
   const saveBtn = document.querySelector(".save-btn");
   const countElement = document.querySelector(".count");
   const urlParams = new URLSearchParams(window.location.search);
   const exerciseId = urlParams.get("id");
   const bestSetElement = document.createElement("p");

   let currentCount = 0; // Счетчик на странице
   let initialCount = 0; // Изначальное количество из БД
   let sets = []; // Массив всех сетов

   function updateCount(count) {
      countElement.textContent = count;
   }

   function updateBestSet(sets) {
      const bestSet = sets.length > 0 ? Math.max(...sets) : 0;
      bestSetElement.textContent = `Best set: ${bestSet}`;
      const container = document.querySelector(".container");
      container.appendChild(bestSetElement);
   }

   function fetchExercise() {
      fetch(`/exercises/${exerciseId}`)
         .then((response) => response.json())
         .then((exercise) => {
            exerciseTitle.textContent = exercise.name;
            initialCount = exercise.count;
            updateCount(currentCount);
            sets = exercise.sets;
            updateBestSet(sets);
         });
   }

   fetchExercise();

   minusBtn.addEventListener("click", () => {
      if (currentCount > 0) {
         currentCount--;
         updateCount(currentCount);
      }
   });

   plusBtn.addEventListener("click", () => {
      currentCount++;
      updateCount(currentCount);
   });

   resetBtn.addEventListener("click", () => {
      currentCount = 0;
      updateCount(currentCount);
   });

   saveBtn.addEventListener("click", () => {
      const newCount = initialCount + currentCount;
      fetch(`/exercises/${exerciseId}`, {
         method: "PUT",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify({ count: newCount, set: currentCount }),
      })
         .then((response) => {
            if (response.ok) {
               window.location.href = "/";
            } else {
               console.error("Error while saving exercise!");
            }
         })
         .catch((error) => console.error("Error:", error));
   });
});
