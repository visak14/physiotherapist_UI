import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

const Exercise = () => {
  const [bodyParts, setBodyParts] = useState([]);
  const [hoveredBodyPart, setHoveredBodyPart] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [therapyDays, setTherapyDays] = useState([]);
  const [sessionsPerDay, setSessionsPerDay] = useState(1);
  const [therapistNotes, setTherapistNotes] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState([]);
  const [savedPrograms, setSavedPrograms] = useState([]);
  const [draggedExerciseIndex, setDraggedExerciseIndex] = useState(null);
  const dropdownRef = useRef(null);
  const wrapperRef = useRef(null);

  const handleOutsideClick = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownVisible(Array(selectedExercises.length).fill(false));
    }
  };

  const fetchSavedPrograms = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/api/saved-programs"
      );
      setSavedPrograms(response.data);
    } catch (error) {
      console.error("Error fetching saved programs:", error);
    }
  };

  useEffect(() => {
    fetchSavedPrograms();
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const fetchBodyParts = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/bodyparts");
        setBodyParts(response.data);
      } catch (error) {
        console.error("Error fetching body parts:", error);
      }
    };
    fetchBodyParts();
  }, []);

  const handleBodyPartHover = async (bodyPart) => {
    setHoveredBodyPart(bodyPart);
    try {
      const { data } = await axios.get(
        "http://localhost:3001/api/exercises-by-bodypart",
        { params: { name: bodyPart } }
      );
      setExercises(data.exercises);
    } catch (error) {
      console.error("Error fetching exercises:", error);
    }
  };

  

  const handleExerciseSelect = (exercise) => {
    if (!selectedExercises.find((e) => e.name === exercise.name)) {
      setSelectedExercises((prev) => [
        ...prev,
        {
          ...exercise,
          side: null,
          holdTime: exercise.holdTime || 0,
          stage: exercise.stage || "Beginner",
          weight: exercise.weight || 0,
          sets: 0,
          reps: 0,
        },
      ]);
      setDropdownVisible((prev) => [...prev, false]);
      setDropdownOpen(false);

      console.log("Exercise added:", exercise);
    } else {
      console.log("Exercise already selected:", exercise);
    }
  };

  const toggleSide = (index, side) => {
    const updatedExercises = [...selectedExercises];
    updatedExercises[index].side =
      updatedExercises[index].side === side ? null : side;
    setSelectedExercises(updatedExercises);
  };

  const duplicateExercise = (index, side) => {
    const exerciseToDuplicate = selectedExercises[index];
    if (
      !selectedExercises.find(
        (e) => e.id === exerciseToDuplicate.id && e.side === side
      )
    ) {
      setSelectedExercises((prev) => [
        ...prev,
        { ...exerciseToDuplicate, side },
      ]);
    }
  };

  const saveCombo = async () => {
    const newProgram = {
      name: `Combo ${new Date().toLocaleString()}`,
      exercises: selectedExercises.map((ex) => ({
        exercise: ex.name,
        sets: ex.sets || 0,
        reps: ex.reps || 0,
        holdTime: ex.holdTime || 0,
        side: ex.side || "Both",
        stage: ex.stage || "Beginner",
        weight: ex.weight || 0,
      })),
      days: therapyDays,
      sessionsPerDay: sessionsPerDay,
      notes: therapistNotes,
    };

    try {
      const response = await axios.post(
        "http://localhost:3001/api/saved-programs",
        newProgram
      );
      console.log("Saved combo:", response.data);
      fetchSavedPrograms();
      clearAll();
    } catch (error) {
      console.error("Error saving combo:", error);
    }
  };

  const clearAll = () => {
    setSelectedExercises([]);
    setExercises([]);
    setDropdownVisible([]);
    setTherapistNotes("");
    setSessionsPerDay(0);
    setTherapyDays([]);
  };

  const handleInputChange = (index, field, value) => {
    const updatedExercises = [...selectedExercises];
    const intValue = Math.max(0, Number(value));
    updatedExercises[index][field] = isNaN(intValue) ? 0 : intValue;
    setSelectedExercises(updatedExercises);
  };

  const onDragStart = (index) => {
    setDraggedExerciseIndex(index);
  };

  const handleExerciseDelete = (index) => {
    const updatedExercises = selectedExercises.filter((_, i) => i !== index);
    setSelectedExercises(updatedExercises);
  };

  const onDragOver = (event) => {
    event.preventDefault();
  };
  const onDrop = (event, index) => {
    event.preventDefault();
    if (draggedExerciseIndex === null) return;
    const updatedExercises = [...selectedExercises];
    const draggedExercise = updatedExercises[draggedExerciseIndex];
    updatedExercises.splice(draggedExerciseIndex, 1);
    updatedExercises.splice(index, 0, draggedExercise);
    setSelectedExercises(updatedExercises);
    setDraggedExerciseIndex(null);
  };

  return (
    <div className="flex h-[100vh] w-[100vw] justify-center">
      <div className=" justify-center my-32 rounded-md h-[50vh] w-[75vw]">
        

      <div className="relative inline-block h-[20%] text-left w-full">
  <div className="flex flex-row justify-between w-full gap-2 items-center my-4 px-2 sm:px-4">
    <div className="flex w-full md:w-3/4 gap-2">
      <button
        className="text-gray-500 border-2 border-gray-500 text-center w-1/2 py-2 rounded-md shadow-lg flex items-center justify-center"
      >
        Knee Rehab Exercise
      </button>
      <button
        className="bg-white text-gray-500 border-2 border-gray-500 w-1/2 py-2 rounded-md shadow-lg flex items-center justify-between px-4"
      >
        Select Combos
        <FontAwesomeIcon icon={faCaretDown} />
      </button>
    </div>
    <div className="flex  lg:w-[25%] md:w-[50%]  ">
      <button
        onClick={clearAll}
        className="text-red-400 border-red-400 border-2 w-full py-2 rounded-md shadow-lg flex items-center justify-center"
      >
        Clear All
      </button>
    </div>
  </div>
</div>


        <div
  onDragOver={onDragOver}
  ref={wrapperRef}
  className="border-2 border-gray-400 p-2 rounded-md gap-2 my-2 h-[50%] w-full md:w-[100%] lg:w-full xl:w-full overflow-auto"
>
  {selectedExercises.map((exercise, index) => (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDrop={(event) => onDrop(event, index)}
      key={index}
      className="p-4 bg-blue-50 border-2 border-gray-100 my-2 rounded-lg space-y-4"
    >
      <div className="flex items-center justify-between space-x-4">
        <span className="text-md font-semibold text-gray-700 flex-grow">
          {exercise.name}
        </span>

        <div className="flex items-center space-x-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only"
              onChange={() =>
                toggleSide(index, exercise.side === "Left" ? "Right" : "Left")
              }
              checked={exercise.side === "Right"}
            />
            <div className="w-20 h-10 pt-2 pl-2 bg-white rounded-sm shadow-inner">
              <span className="text-sm gap-2  font-medium text-black text-center">
                {exercise.side === "Right" ? "Left  " : "Right"}
                {exercise.side === "Right" ? "Left" : " Right"}
              </span>
            </div>
            
            <div
              className={`absolute w-10 h-6 pl-2 bg-blue-500 rounded-md transform transition-transform duration-300 ${
                exercise.side === "Right" ? "translate-x-8" : "translate-x-1"
              }`}
            >
              <span className="text-sm font-medium text-white text-center">
                {exercise.side === "Right" ? "Right" : "Left"}
              </span>
            </div>
          </label>
        </div>

        <button
          onClick={() => duplicateExercise(index)}
          className="px-2 py-1 text-sm bg-blue-500 text-white rounded-full hover:bg-blue-600"
        >
          Duplicate
        </button>

        <button
          onClick={() => handleExerciseDelete(index)}
          className="p-1 rounded-md text-gray-500 hover:text-red-500"
        >
          <FontAwesomeIcon icon={faTrash} className="text-lg" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:gap-5 lg:w-[85%] lg:grid-cols-5 gap-4 md:gap-2">
        <div className="flex items-center w-full lg:gap-5 lg:text-lg   bg-white px-2 py-1 rounded-md space-x-1">
          <label className="text-sm">Sets</label>
          <button
            onClick={() =>
              handleInputChange(index, "sets", Math.max(0, exercise.sets - 1))
            }
            className="px-2 bg-gray-300 rounded-md"
          >
            -
          </button>
          <input
            type="number"
            value={exercise.sets || 0}
            readOnly
            className="w-10 text-center bg-transparent outline-none text-gray-700"
          />
          <button
            onClick={() =>
              handleInputChange(index, "sets", exercise.sets + 1)
            }
            className="px-2 bg-gray-300 rounded-md"
          >
            +
          </button>
        </div>

        <div className="flex items-center w-full lg:gap-5 lg:text-lg bg-white px-2 py-1 rounded-md space-x-1">
          <label className="text-sm">Reps</label>
          <button
            onClick={() =>
              handleInputChange(index, "reps", Math.max(0, exercise.reps - 1))
            }
            className="px-2 bg-gray-300 rounded-md"
          >
            -
          </button>
          <input
            type="number"
            value={exercise.reps || 0}
            readOnly
            className="w-10 text-center bg-transparent outline-none text-gray-700"
          />
          <button
            onClick={() =>
              handleInputChange(index, "reps", exercise.reps + 1)
            }
            className="px-2 bg-gray-300 rounded-md"
          >
            +
          </button>
        </div>

        <div className="flex items-center w-full bg-white lg:gap-2 lg:text-lg px-2 py-1 rounded-md space-x-1">
          <label className="text-sm">Hold Time</label>
          <button
            onClick={() =>
              handleInputChange(
                index,
                "holdTime",
                Math.max(0, exercise.holdTime - 1)
              )
            }
            className="px-2 bg-gray-300 rounded-md"
          >
            -
          </button>
          <input
            type="number"
            value={exercise.holdTime || 0}
            readOnly
            className="w-10 text-center bg-transparent outline-none text-gray-700"
          />
          <button
            onClick={() =>
              handleInputChange(index, "holdTime", exercise.holdTime + 1)
            }
            className="px-2 bg-gray-300 rounded-md"
          >
            +
          </button>
        </div>

        <div className="flex items-center w-full bg-white px-2 py-1 lg:gap-5 lg:text-lg rounded-md space-x-1">
          
          <button
            onClick={() =>
              handleInputChange(
                index,
                "weight",
                Math.max(0, exercise.weight - 1)
              )
            }
            className="px-2 bg-gray-300 rounded-md"
          >
            -
          </button>
          
          <input
            type="number"
            value={exercise.weight || 0}
            readOnly
            className="w-10 text-center bg-transparent outline-none text-gray-700"
          />
          <button
            onClick={() =>
              handleInputChange(index, "weight", exercise.weight + 1)
            }
            className="px-2 bg-gray-300 rounded-md"
          >
            +
          </button>
          <label className="text-sm">Kg</label>
        </div>

        <div className="flex flex-col items-center px-2 py-1 rounded-md w-full">
  <select
    value={exercise.stage || ""}
   
    onChange={(e) => handleInputChange(index, "stage", e.target.value)}
    className="w-full bg-white text-gray-700 p-2 rounded border border-gray-300 outline-none"
  >
    
    <option value="Beginner">Beginner</option>
    <option value="Intermediate">Intermediate</option>
    <option value="Advanced">Advanced</option>
  </select>
</div>

      </div>
    </div>
  ))}
</div>

<div className="flex flex-col lg:flex-row justify-between my-10 mt-0 space-y-6 lg:space-y-0">
          {/* Therapy Days */}
          <div className="">
          <div className="relative inline-block h-1/3  text-left w-full ">
            <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0">
            <button
              className=" text-gray-500  border-2 border-gray-400 px-4 py-2 rounded-md shadow-lg flex items-center"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              Add Exercise
              <FontAwesomeIcon icon={faCaretDown} className="ml-2" />
            </button>
          </div>
          {dropdownOpen && (
            <ul className="absolute mt-2 w-36 bg-gray-100 rounded-md shadow-lg p-2 z-10">
              {bodyParts.map((bodyPart) => (
                <li
                  key={bodyPart}
                  onMouseEnter={() => handleBodyPartHover(bodyPart)}
                  className="relative p-2 cursor-pointer hover:bg-gray-200 rounded-md font-medium text-gray-800"
                >
                  {bodyPart}
                  {hoveredBodyPart === bodyPart && exercises.length > 0 && (
                    <ul className="absolute left-full top-0 ml-2 bg-white border border-gray-200 rounded-md shadow-lg p-2 w-36">
                      {exercises.map((exercise) => (
                        <li
                          key={exercise.id}
                          onClick={() => handleExerciseSelect(exercise)}
                          className="p-2 text-gray-700 hover:bg-gray-100 rounded-md"
                        >
                          {exercise.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}

          </div>
          </div>

          {/* Sessions per Day */}
          <div className="flex items-center gap-2 flex-col space-x-2">
            <h3 className="font-semibold text-gray-700 text-start -ml-20">Daily Interval</h3>

          <div className=" flex flex-row">
          <div className="flex items-center rounded-md px-2">
              <button
               
                className="text-white border w-5 h-15 bg-gray-300 hover:text-gray-700 focus:outline-none"
              >
                <span className="text-lg">−</span>
              </button>

              <input
                value={sessionsPerDay}
                onChange={(e) =>
                  setSessionsPerDay(Math.max(0, Number(e.target.value)))
                }
                className="w-12 text-center text-gray-700 focus:outline-none bg-transparent"
                min="0"
              />

              <button
                onClick={() => setSessionsPerDay(sessionsPerDay + 1)}
                className="text-white border w-5 h-15 bg-gray-300 hover:text-gray-700 focus:outline-none"
              >
                <span className="text-lg">+</span>
              </button>
            </div>

            <span className="text-gray-500">sessions/day</span>
          </div>
          
          </div>
        </div>

         <hr className=" border-1 border-gray-400"/>

        <div className="flex flex-col lg:flex-row justify-between my-10 mt-10 space-y-6 lg:space-y-0">
          {/* Therapy Days */}
          <div className="">
            <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0">
              <div className="flex items-center mb-2">
                <h3 className="mr-4 font-semibold">Day of Week</h3>
                <button
                  className="flex items-center px-3 py-1 bg-blue-500 text-white text-sm rounded-md focus:outline-none"
                  onClick={() =>
                    setTherapyDays(["M", "Tu", "W", "Th", "F", "S", "Su"])
                  }
                >
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={therapyDays.length === 7}
                    readOnly
                  />
                  Select All
                </button>
              </div>
            </div>
            <div className="flex gap-2 my-2 ">
              {["S", "M", "Tu", "W", "Th", "F", "Su"].map((day) => (
                <label
                  key={day}
                  className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                    therapyDays.includes(day)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                  onClick={() => {
                    setTherapyDays((prev) =>
                      prev.includes(day)
                        ? prev.filter((d) => d !== day)
                        : [...prev, day]
                    );
                  }}
                >
                  {day}
                </label>
              ))}
            </div>
          </div>

          {/* Sessions per Day */}
          <div className=" flex flex-col gap-3  items-center  space-x-2">
            <h3 className="font-semibold -ml-10 text-gray-700">Daily Frequency</h3>

           <div className=" flex flex-row">
           <div className="flex items-center  rounded-md px-2">
              <button
                onClick={() =>
                  setSessionsPerDay(Math.max(0, sessionsPerDay - 1))
                }
                className="text-white border w-5 h-15 bg-gray-300 hover:text-gray-700 focus:outline-none"
              >
                <span className="text-lg">−</span>
              </button>

              <input
                value={sessionsPerDay}
                onChange={(e) =>
                  setSessionsPerDay(Math.max(0, Number(e.target.value)))
                }
                className="w-12 text-center text-gray-700 focus:outline-none bg-transparent"
                min="0"
              />

              <button
                onClick={() => setSessionsPerDay(sessionsPerDay + 1)}
                className="text-white border w-5 h-15 bg-gray-300 hover:text-gray-700 focus:outline-none"
              >
                <span className="text-lg">+</span>
              </button>
            </div>

            <span className="text-gray-500">sessions/day</span>
           </div>
          </div>
        </div>
        <div className="  space-y-2">
          <h3 className="font-semibold text-gray-700 text-start">Therapist Notes</h3>
          <textarea
            placeholder="Add  Notes"
            value={therapistNotes}
            onChange={(e) => setTherapistNotes(e.target.value)}
            className="w-full h-32 p-2 border border-blue-200 bg-blue-50 rounded-md"
          />
        </div>

        <div className="mt-2 p-4 bg-white rounded-lg">
  <div className="flex justify-end mb-4">
    <button
      onClick={saveCombo}
      className="bg-blue-500 text-white px-4 py-2 rounded-md"
    >
      Save as Combo
    </button>
  </div>
</div>

        <div className="my-0 p-0  border-2 border-gray-300 bg-white rounded-lg shadow-md h-52 overflow-auto">
          <h3 className="text-lg font-semibold mb-10 sticky top-0  text-center  bg-gray-200 rounded-md h-10">
            Saved Programs
          </h3>
          <ul className=" p-4">
            {savedPrograms.map((program) => (
              <li key={program.id} className="border-b border-gray-200 py-2">
                <div className="flex justify-between">
                  <span>{program.name}</span>
                  <span>{program.days.join(", ")}</span>
                </div>
                <div>
                  <strong>Exercises:</strong>
                  <ul>
                    {program.exercises.map((exercise, idx) => (
                      <li key={idx}>
                        {exercise.exercise} - Sets: {exercise.sets}, Reps:{" "}
                        {exercise.reps}, Hold Time: {exercise.holdTime}, Weight:{" "}
                        {exercise.weight}, Side: {exercise.side}, Stage:{" "}
                        {exercise.stage}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>Sessions per Day:</strong> {program.sessionsPerDay}
                </div>
                <div>
                  <strong>Therapist Notes:</strong> {program.notes}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Exercise;
