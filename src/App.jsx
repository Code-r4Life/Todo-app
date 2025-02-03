import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Navbar from './components/Navbar';
import add from './add.svg';
import deleted from './deleted.svg';
import deleteall from './deleteall.svg';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [todo, setTodo] = useState({ name: "", time: "" });
  const [todos, setTodos] = useState([]);
  const [isConfirm, setIsConfirm] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState(null);
  const [edit, setEdit] = useState(false);
  const [originalTodo, setOriginalTodo] = useState(null);  // New state to store the original todo
  const [completed, setCompleted] = useState(false);
  const [deletedTodo, setDeletedTodo] = useState([]);

  useEffect(() => {
    let todoString = localStorage.getItem("todos");
    if(todoString){
      let todos = JSON.parse(todoString);
      setTodos(todos);
    }
  }, [])

  // to save to local storage
  const saveToLS = (params) => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }
  
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const sortTodosByTime = () => {
    setTodos(prevTodos => {
      return [...prevTodos].sort((a, b) => {
        // Compare time in 24-hour format (HH:MM)
        if (a.time < b.time) return -1;  // a comes before b
        if (a.time > b.time) return 1;   // b comes before a
        return 0;  // times are equal
      });
    });
  };
  
  const handleAddClick = () => {
    setTodo({ name: "", time: "" });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCloseConfirm = ()=> {
    setIsConfirm(false);
    setTodoToDelete(null);
  }

  const handleEdit = (e, id)=> {
    setEdit(true);
    let t = todos.filter(todo=> todo.id === id);
    setTodo(t[0]);
    setOriginalTodo(t[0]);
    // to toggle isCompleted
    setTodos((prevTodos) => prevTodos.map((todo) =>
      todo.id === id
        ? { ...todo, isCompleted: !todo.isCompleted, fadeOut: !todo.isCompleted }
        : todo
      )
    );

    // Remove the todo after the fade-out duration
    setTimeout(() => {
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
    }, 500); // Match this delay to the fade-out duration
    sortTodosByTime();
    saveToLS();
  }

  const handleCloseEdit = ()=> {
    setEdit(false);
    setTodos([...todos, originalTodo]);
    sortTodosByTime();
  }

  const handleSubmit = () => {
    setTodos([...todos, { id: uuidv4(), ...todo, isCompleted: false }]);
    setTodo({ name: "", time: "" });
    setIsModalOpen(false);
    setEdit(false);
    sortTodosByTime();
    saveToLS();
  };

  const handleCheck = (e) => {
    e.stopPropagation();
    setIsConfirm(true);
    setTodoToDelete(e.target.value); // Store the todoId to be deleted
    saveToLS();
  };

  const handleConfirmDelete = () => {
    if (todoToDelete) {
      // to toggle isCompleted
      setTodos((prevTodos) => prevTodos.map((todo) =>
        todo.id === todoToDelete
          ? { ...todo, isCompleted: !todo.isCompleted, fadeOut: !todo.isCompleted }
          : todo
      )
    );
    let todoToFind = todos.find(todo=> todo.id === todoToDelete);
    if(todoToFind){
      setDeletedTodo([...deletedTodo, {id: uuidv4(), name: todoToFind.name, time: todoToFind.time, isCompleted: true, fadeOut: false}]);
    }
  
    // Remove the todo after the fade-out duration
    setTimeout(() => {
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== todoToDelete));
    }, 500); // Match this delay to the fade-out duration
    }

    setIsConfirm(false); // Close the confirmation modal
    setTodoToDelete(null); // Reset the todoId
    sortTodosByTime();
    saveToLS();
  };

  const toggleCompleted = ()=> {
    setCompleted(!completed);
  }

  const deleteAll = ()=> {
    setDeletedTodo([]);
  }

  const handleRestore = (e, id)=> {
    console.log(e, id);
    let todoToRestore = deletedTodo.find(todo => todo.id === id);
    if (!todoToRestore) return;

      setDeletedTodo((prevTodos) => prevTodos.map((todo) =>
        todo.id === id
          ? { ...todo, isCompleted: !todo.isCompleted, fadeOut: !todo.isCompleted }
          : todo
      )
    );

    // Add restored todo with fade-in effect
    setTodos([...todos, {id: id, name: e.name, time: e.time, isCompleted: false, fadeOut: false }]);

    // Remove from deleted list after animation
    setTimeout(() => {
      setDeletedTodo(prevDeleted => prevDeleted.filter(todo => todo.id !== id));
    }, 500);
    sortTodosByTime();
    saveToLS();
  }
  

  return (
    <>
      <Navbar />
      <div className='max-w-[90vw] sm:max-w-[50vw] mx-auto my-5 rounded-xl p-5 border border-yellow-700'>
        <div className='flex flex-col bg-[#12b8ae] text-center p-5 font-semibold rounded-t-xl'>
          Todo List
        </div>
        <div className='bg-black flex flex-col rounded-b-xl relative'>
          <div className='flex items-center justify-between'>
            <div className='flex flex-col justify-center gap-y-1 pl-5 py-8 text-white'>
              <span className='font-bold text-[20px]'>Today</span>
              <span className='font-light text-[14px] text-gray-400'>{formattedDate}</span>
            </div>
            <button className='bg-[rgb(31,33,37)] p-3 rounded-full mr-3' onClick={toggleCompleted}>
              <img src={deleted} alt='deleted' />
            </button>
          </div>
          <div className="todos flex flex-col gap-y-4 pl-5 pb-12 pr-5">
            {(completed === false && todos.length === 0) && <div className='text-white font-medium'>No todos to display</div>}
            {(completed === true && deletedTodo.length === 0) ? <div className='text-white font-medium'>No deleted todos</div> : (completed === true && deletedTodo.length > 0 && (
              <button className='bg-[rgb(31,33,37)] px-4 py-3 rounded-full m-auto flex justify-center gap-x-2' onClick={deleteAll}>
                  <img src={deleteall} alt='delete All' />
                  <span className='text-white font-medium'>Delete All</span>
              </button>
            ))}
            {completed === false && todos.map(todo => {
              return ( 
                <div
                  key={todo.id}
                  onClick={()=> handleEdit(todo, todo.id)}
                  className={`flex items-center justify-between text-white bg-[rgb(31,33,37)] p-3 rounded-xl transition-all duration-500 ease-in ${todo.fadeOut ? 'opacity-0' : ''}`}
                >
                  <div className="flex items-center gap-x-2">
                    <div className="relative inline-block w-5 h-5">
                      <input
                        type="checkbox"
                        value={todo.id}
                        onClick={handleCheck}
                        className={`absolute w-full h-full appearance-none rounded-full border-2 border-white bg-[rgb(31,33,37)] cursor-pointer ${todo.isCompleted ? "checked:bg-white checked:border-[#12b8ae] checked:ring-2 checked:ring-[#12b8ae] checked:ring-inset" : ""}`}/>
                    </div>
                    <span className={`${todo.isCompleted ? "line-through text-[rgb(145,142,142)]" : ""} text-[18px]`}>{todo.name}</span>
                  </div>
                  <span className={`${todo.isCompleted ? "text-[rgb(145,142,142)]": ""} text-[14px] font-light`}>{todo.time}</span>
                </div>
              );
            })}
            {completed === true && deletedTodo.map(todo => {
              return ( 
                <div
                  key={todo.id}
                  onClick={()=> handleRestore(todo, todo.id)}
                  className={`flex items-center justify-between text-white bg-[rgb(31,33,37)] p-3 rounded-xl transition-all duration-500 ease-in cursor-pointer ${todo.fadeOut ? 'opacity-0' : ''}`}
                >
                  <div className="flex items-center gap-x-2">
                    <div className="relative inline-block w-5 h-5">
                      <input
                        type="checkbox"
                        className={`absolute w-full h-full appearance-none rounded-full border-2 bg-[rgb(31,33,37)] cursor-pointer ${todo.isCompleted ? "bg-white border-[#12b8ae] ring-2 ring-[#12b8ae] ring-inset" : ""}`}/>
                    </div>
                    <span className={`${todo.isCompleted ? "line-through text-[rgb(145,142,142)]" : ""} text-[18px]`}>{todo.name}</span>
                  </div>
                  <span className={`${todo.isCompleted ? "text-[rgb(145,142,142)]": ""} text-[14px] font-light`}>{todo.time}</span>
                </div>
              );
            })}
          </div>
          <div
            className='h-10 w-10 rounded-full bg-[#12b8ae] flex justify-center items-center mb-3 absolute right-3 bottom-0 z-10 cursor-pointer'
            onClick={handleAddClick}
          >
            <img src={add} alt='add' />
          </div>
        </div>
      </div>

      {/* Modal for adding todo */}
      {isModalOpen && (
        <div className='fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50'>
          <div className='bg-white p-5 rounded-lg w-80'>
            <h2 className='text-xl font-bold mb-4'>Add Todo</h2>
            <div className='mb-4'>
              <label className='block text-sm font-semibold'>Todo Name</label>
              <input
                type='text'
                value={todo.name}
                onChange={(e) => setTodo({ ...todo, name: e.target.value })}
                className='w-full p-2 border rounded-lg mt-2'
                placeholder='Enter todo name'
              />
            </div>
            <div className='mb-4'>
              <label className='block text-sm font-semibold'>Scheduled Time</label>
              <input
                type='time'
                value={todo.time}
                onChange={(e) => setTodo({ ...todo, time: e.target.value })}
                className='w-full p-2 border rounded-lg mt-2'
              />
            </div>
            <div className='flex justify-end gap-2'>
              <button onClick={handleCloseModal} className='px-4 py-2 bg-gray-400 text-white rounded-lg cursor-pointer'>Cancel</button>
              <button onClick={handleSubmit} disabled={todo.name.length <=3 || todo.time == ""} className='px-4 py-2 bg-[#12b8ae] text-white rounded-lg disabled:bg-[#778382] cursor-pointer'>Add Todo</button>
            </div>
          </div>
        </div>
      )}

      {/* To confirm deletion of todos */}
      {isConfirm && (
        <div className='fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50'>
          <div className='bg-white p-5 rounded-lg w-80 flex flex-col items-center'>
            <h2 className='text-xl font-bold mb-4'>Delete todo?</h2>
            <div className='flex justify-end gap-3'>
              <button className='px-4 py-2 bg-[#12b8ae] text-white rounded-lg' onClick={handleConfirmDelete}>Yes</button>
              <button className='px-4 py-2 bg-gray-400 text-white rounded-lg' onClick={handleCloseConfirm}>No</button>
            </div>
          </div>
        </div>
      )}

      {/* To edit the todos */}
      {edit && (
        <div className='fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50'>
          <div className='bg-white p-5 rounded-lg w-80'>
            <h2 className='text-xl font-bold mb-4'>Update todo?</h2>
            <div className='mb-4'>
              <label className='block text-sm font-semibold'>Todo Name</label>
              <input
                type='text'
                value={todo.name}
                onChange={(e) => setTodo({ ...todo, name: e.target.value })}
                className='w-full p-2 border rounded-lg mt-2'
                placeholder='Enter todo name'
              />
            </div>
            <div className='mb-4'>
              <label className='block text-sm font-semibold'>Scheduled Time</label>
              <input
                type='time'
                value={todo.time}
                onChange={(e) => setTodo({ ...todo, time: e.target.value })}
                className='w-full p-2 border rounded-lg mt-2'
              />
            </div>
            <div className='flex justify-end gap-2'>
              <button className='px-4 py-2 bg-[#12b8ae] text-white rounded-lg' onClick={handleSubmit}>Save</button>
              <button className='px-4 py-2 bg-gray-400 text-white rounded-lg' onClick={handleCloseEdit}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
