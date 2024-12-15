document.addEventListener("DOMContentLoaded", () => {
   const exerciseList = document.getElementById("exercise-list");
   const newExerciseNameInput = document.getElementById("new-exercise-name");
   const addExerciseBtn = document.getElementById("add-exercise-btn");

   function fetchExercises() {
      fetch("/exercises")
         .then((response) => response.json())
         .then((exercises) => {
            exerciseList.innerHTML = "";
            exercises.forEach((exercise) => {
               // new li
               const li = document.createElement("li");
               li.classList.add("exercise-item");
               const link = document.createElement("a");
               link.href = `exercise.html?id=${exercise.id}`;
               link.textContent = exercise.name;
               const exerciseInfo = document.createElement("span");
               exerciseInfo.textContent = `${exercise.count}`;
               link.appendChild(exerciseInfo);
               li.appendChild(link);
               // options
               const optionsButton = document.createElement("button");
               optionsButton.classList.add("options-button");
               optionsButton.textContent = "...";

               const optionsMenu = document.createElement("div");
               optionsMenu.classList.add("options-menu");
               optionsMenu.style.display = "none";
               // edit
               const editButton = document.createElement("button");
               editButton.textContent = "Edit";
               editButton.addEventListener("click", () => {
                  editExercise(exercise);
                  optionsMenu.style.display = "none";
               });
               optionsMenu.appendChild(editButton);

               // delete
               const deleteButton = document.createElement("button");
               deleteButton.textContent = "Delete";
               deleteButton.addEventListener("click", () => {
                  deleteExercise(exercise.id);
                  optionsMenu.style.display = "none";
               });
               optionsMenu.appendChild(deleteButton);
               li.appendChild(optionsButton);
               li.appendChild(optionsMenu);

               optionsButton.addEventListener("click", () => {
                  optionsMenu.style.display =
                     optionsMenu.style.display === "none" ? "block" : "none";
               });
               exerciseList.appendChild(li);
            });
         });
   }

   function editExercise(exercise) {
      const newName = prompt("Enter new exercise name:", exercise.name);
      if (newName && newName.trim() !== exercise.name) {
         fetch(`/exercises/${exercise.id}`, {
            method: "PUT",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: newName.trim() }),
         })
            .then((response) => {
               if (response.ok) {
                  fetchExercises();
               } else {
                  console.error("Error while editing exercise");
               }
            })
            .catch((error) => console.error("Error:", error));
      }
   }

   function deleteExercise(id) {
      if (confirm("Are you sure, you want to delete exercise?")) {
         fetch(`/exercises/${id}`, {
            method: "DELETE",
         })
            .then((response) => {
               if (response.ok) {
                  fetchExercises();
               } else {
                  console.error("Error while deleting exercise");
               }
            })
            .catch((error) => console.error("Error:", error));
      }
   }

   fetchExercises();

   addExerciseBtn.addEventListener("click", () => {
      const exerciseName = newExerciseNameInput.value.trim();
      if (exerciseName) {
         fetch("/exercises", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: exerciseName }),
         })
            .then((response) => {
               if (response.ok) {
                  newExerciseNameInput.value = "";
                  fetchExercises();
               } else {
                  console.error("Error while creating new exercise");
               }
            })
            .catch((error) => console.error("Error:", error));
      }
   });
});
