import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faBars, faTrash } from "@fortawesome/free-solid-svg-icons";

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
  };
}

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

  const toggleDropdownBars = (index) => {
    setDropdownVisible((prev) => {
      const newVisibility = [...prev];
      newVisibility[index] = !newVisibility[index]; // Toggle visibility for the specific exercise
      return newVisibility;
    });
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
      <div className="border-2 justify-center my-32 border-gray-200 rounded-md h-[50vh] w-[75vw]">
        <div className="relative inline-block h-1/3  text-left w-full ">
          <div className="flex justify-between  items-center my-4 px-4">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              Add Exercise
              <FontAwesomeIcon icon={faCaretDown} className="ml-2" />
            </button>
            <button
              onClick={clearAll}
              className="bg-red-300 text-white px-4 py-2 rounded-md shadow-lg flex items-center"
            >
              Clear All
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

        <div 
         onDragOver={onDragOver}
            ref={wrapperRef}
            
        
        className="border-t-2 border-gray-300  rounded-md gap-2 my-10 h-[50%] w-auto overflow-auto">
          {selectedExercises.map((exercise, index) => (
            <div
  draggable
  onDragStart={() => onDragStart(index)}
  onDrop={(event) => onDrop(event, index)}
  key={index}
  className="mt-4 border-2 border-gray-400 p-4 bg-white rounded-lg shadow-md"
>
  <div className="flex flex-col sm:flex-row items-center sm:justify-between space-y-4 sm:space-y-0">
    <span className="text-lg font-semibold text-gray-700 text-center sm:text-left">
      {exercise.name}
    </span>

    <div className="flex items-center space-x-4">
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only"
          onChange={() => toggleSide(index, "Right")}
          checked={exercise.side === "Right"}
        />
        <div className="w-14 h-8 bg-gray-200 rounded-full shadow-inner"></div>
        <div
          className={`absolute w-6 h-6 bg-blue-500 rounded-full transition-transform duration-300 ease-in-out ${
            exercise.side === "Right" ? "transform translate-x-full" : ""
          }`}
        ></div>
      </label>
    </div>

    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => toggleDropdownBars(index)}
        className="bg-gray-200 p-1 rounded-md"
      >
        <FontAwesomeIcon icon={faBars} />
      </button>
      {dropdownVisible[index] && (
        <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-md p-2 w-40">
          <button
            onClick={() => duplicateExercise(index, "Left")}
            disabled={selectedExercises.some(
              (e) => e.id === exercise.id && e.side === "Left"
            )}
            className="block w-full hover:bg-gray-200 text-left"
          >
            Duplicate Left
          </button>
          <button
            onClick={() => duplicateExercise(index, "Right")}
            disabled={selectedExercises.some(
              (e) => e.id === exercise.id && e.side === "Right"
            )}
            className="block w-full hover:bg-gray-200 text-left"
          >
            Duplicate Right
          </button>
        </div>
      )}
    </div>

    <button
      onClick={() => handleExerciseDelete(index)}
      className="p-1 rounded-md"
    >
      <FontAwesomeIcon icon={faTrash} className="text-red-200 w-5 h-5" />
    </button>
  </div>

  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
    <div className="flex flex-col items-center bg-gray-200 p-2 rounded-md">
      <label className="text-sm">Sets</label>
      <input
        type="number"
        value={exercise.sets || 0}
        onChange={(e) =>
          handleInputChange(index, "sets", e.target.value)
        }
        className="mt-1 w-full sm:w-16 bg-white p-1 text-center rounded border-gray-300 focus:ring-0"
      />
    </div>
    <div className="flex flex-col items-center bg-gray-200 p-2 rounded-md">
      <label className="text-sm">Reps</label>
      <input
        type="number"
        value={exercise.reps || 0}
        onChange={(e) =>
          handleInputChange(index, "reps", e.target.value)
        }
        className="mt-1 w-full sm:w-16 bg-white p-1 text-center rounded border-gray-300 focus:ring-0"
      />
    </div>
    <div className="flex flex-col items-center bg-gray-200 p-2 rounded-md">
      <label className="text-sm">Time (S)</label>
      <input
        type="number"
        value={exercise.holdTime || 0}
        onChange={(e) =>
          handleInputChange(index, "holdTime", e.target.value)
        }
        className="mt-1 w-full sm:w-16 bg-white p-1 text-center rounded border-gray-300 focus:ring-0"
      />
    </div>
    <div className="flex flex-col items-center bg-gray-200 p-2 rounded-md">
      <label className="text-sm">Weight</label>
      <input
        type="number"
        value={exercise.weight || 0}
        onChange={(e) =>
          handleInputChange(index, "weight", e.target.value)
        }
        className="mt-1 w-full sm:w-16 bg-white p-1 text-center rounded border-gray-300 focus:ring-0"
      />
    </div>
    <div className="flex flex-col items-center bg-gray-200 p-2 rounded-md">
      <label className="text-sm">Stage</label>
      <select
        value={exercise.stage || "Beginner"}
        onChange={(e) => {
          const updatedExercises = [...selectedExercises];
          updatedExercises[index].stage = e.target.value;
          setSelectedExercises(updatedExercises);
        }}
        className="mt-1 w-full bg-white p-1 rounded border-gray-300 focus:ring-0"
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

        <div className="flex flex-col lg:flex-row justify-between my-10 mt-20 space-y-6 lg:space-y-0">
  {/* Therapy Days */}
  <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0">
    <label className="mr-4 font-medium">Therapy Days:</label>
    <div className="flex flex-wrap gap-2">
      {["M", "Tu", "W", "Th", "F", "S", "Su"].map((day) => (
        <label key={day} className="flex items-center space-x-1">
          <input
            type="checkbox"
            checked={therapyDays.includes(day)}
            onChange={() => {
              setTherapyDays((prev) =>
                prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
              );
            }}
            className="form-checkbox text-blue-600"
          />
          <span className="text-sm">{day}</span>
        </label>
      ))}
    </div>
  </div>

  {/* Sessions per Day */}
  <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0">
    <label className="mr-4 font-medium">Sessions per Day:</label>
    <input
      type="number"
      value={sessionsPerDay}
      onChange={(e) => setSessionsPerDay(Math.max(0, Number(e.target.value)))}
      className="border border-gray-300 rounded-md w-full lg:w-20 p-2 text-center"
    />
  </div>
</div>
<textarea
  placeholder="Therapist Notes"
  value={therapistNotes}
  onChange={(e) => setTherapistNotes(e.target.value)}
  className="w-full h-32 p-2 border border-gray-300 rounded-md"
/>

        <div className="mt-6 p-4 bg-white  rounded-lg ">
          <div className="flex justify-between mb-4">
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
