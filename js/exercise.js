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
   const setsList = document.createElement("ul");

   let currentCount = 0;
   let sets = [];

   function updateCount(count) {
      countElement.textContent = count;
   }

   function updateBestSet(sets) {
      const bestSet =
         sets.length > 0 ? Math.max(...sets.map((set) => set.value)) : 0;
      bestSetElement.textContent = `Best set: ${bestSet}`;
      const btns = document.querySelector(".btns");
      btns.insertBefore(bestSetElement, btns.children[0]);
   }

   function displaySets(sets) {
      setsList.innerHTML = "";
      const today = new Date();
      const todayStart = new Date(
         today.getFullYear(),
         today.getMonth(),
         today.getDate()
      ).getTime();

      const todaySets = sets.filter(
         (set) =>
            new Date(set.timestamp).getTime() >= todayStart && set.value > 0
      );

      if (todaySets.length === 0) {
         const li = document.createElement("li");
         li.textContent = "Сегодня ты не занимался, дрищ";
         setsList.appendChild(li);
      } else {
         todaySets
            .slice()
            .reverse()
            .forEach((set) => {
               const setDate = new Date(set.timestamp);
               const hours = setDate.getHours().toString().padStart(2, "0");
               const minutes = setDate.getMinutes().toString().padStart(2, "0");
               const li = document.createElement("li");
               li.textContent = `${hours}:${minutes} - ${set.value}`;
               setsList.appendChild(li);
            });
      }
      const container = document.querySelector(".container");
      container.appendChild(setsList);
      setsList.className = "last_sets";
   }

   function fetchExercise() {
      fetch(`/exercises/${exerciseId}`)
         .then((response) => response.json())
         .then((exercise) => {
            exerciseTitle.textContent = exercise.name;
            sets = exercise.sets;
            updateCount(currentCount);
            updateBestSet(sets);
            displaySets(sets);
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
      fetch(`/exercises/${exerciseId}`, {
         method: "PUT",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify({ set: currentCount }),
      })
         .then((response) => {
            if (response.ok) {
               return fetch(`/exercises/${exerciseId}`);
            } else {
               console.error("Error while saving exercise");
               throw new Error("Error while saving exercise");
            }
         })
         .then((response) => response.json())
         .then((exercise) => {
            sets = exercise.sets;
            updateBestSet(sets);
            displaySets(sets);
            currentCount = 0;
            updateCount(currentCount);
         })
         .catch((error) => console.error("Error:", error));
   });
});
