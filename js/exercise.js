document.addEventListener("DOMContentLoaded", () => {
   const urlParams = new URLSearchParams(window.location.search);
   const exerciseTitle = document.getElementById("exercise-title");
   const minusBtn = document.querySelector(".minus-btn");
   const plusBtn = document.querySelector(".plus-btn");
   const resetBtn = document.querySelector(".reset-btn");
   const saveBtn = document.querySelector(".save-btn");
   const countElement = document.querySelector(".count");
   const exerciseId = urlParams.get("id");
   const bestSetElement = document.createElement("p");
   const setsList = document.querySelector(".sets-list");

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

   function displaySets(sets, view = "today") {
      setsList.innerHTML = "";
      const today = new Date();
      const todayStart = new Date(
         today.getFullYear(),
         today.getMonth(),
         today.getDate()
      ).getTime();

      if (view === "today") {
         const todaySets = sets.filter(
            (set) =>
               new Date(set.timestamp).getTime() >= todayStart && set.value > 0
         );

         if (todaySets.length === 0) {
            const li = document.createElement("li");
            li.textContent = "Not even single rep, huh?";
            setsList.appendChild(li);
         } else {
            todaySets
               .slice()
               .reverse()
               .forEach((set) => {
                  const setDate = new Date(set.timestamp);
                  const hours = setDate.getHours().toString().padStart(2, "0");
                  const minutes = setDate
                     .getMinutes()
                     .toString()
                     .padStart(2, "0");
                  const li = document.createElement("li");
                  li.textContent = `${hours}:${minutes} - ${set.value}`;
                  setsList.appendChild(li);
               });
         }
      } else {
         // Group sets by date
         const groupedSets = sets.reduce((acc, set) => {
            const date = new Date(set.timestamp);
            const dateKey = `${date.getFullYear()}-${(date.getMonth() + 1)
               .toString()
               .padStart(2, "0")}-${date
               .getDate()
               .toString()
               .padStart(2, "0")}`;

            if (!acc[dateKey]) {
               acc[dateKey] = [];
            }
            acc[dateKey].push(set);
            return acc;
         }, {});

         // Display message if no sets available
         if (Object.keys(groupedSets).length === 0) {
            const li = document.createElement("li");
            li.textContent = "At least try!";
            setsList.appendChild(li);
            return;
         }

         // Display daily totals
         Object.entries(groupedSets)
            .sort((a, b) => new Date(b[0]) - new Date(a[0]))
            .forEach(([date, dateSets]) => {
               const totalReps = dateSets.reduce(
                  (sum, set) => sum + set.value,
                  0
               );
               const li = document.createElement("li");
               const [year, month, day] = date.split("-");
               li.textContent = `${day}.${month} - ${totalReps} reps`;
               setsList.appendChild(li);
            });
      }
   }

   function initializeTabs() {
      const tabBtns = document.querySelectorAll(".tab-btn");

      tabBtns.forEach((btn) => {
         btn.addEventListener("click", () => {
            // Update active state
            tabBtns.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            // Display appropriate view
            displaySets(sets, btn.dataset.tab);
         });
      });
   }

   function fetchExercise() {
      fetch(`/exercises/${exerciseId}`)
         .then((response) => response.json())
         .then((exercise) => {
            exerciseTitle.textContent = exercise.name;
            sets = exercise.sets;
            updateCount(currentCount);
            updateBestSet(sets);
            displaySets(sets, "today");
            initializeTabs();
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
            document.querySelectorAll(".tab-btn").forEach((btn) => {
               btn.classList.remove("active");
               if (btn.dataset.tab === "today") {
                  btn.classList.add("active");
               }
            });
            displaySets(sets, "today");
            currentCount = 0;
            updateCount(currentCount);
         })
         .catch((error) => console.error("Error:", error));
   });
});
