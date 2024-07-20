import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './Dashboard.css'
import Modal from 'react-modal';

const Dashboard = () => {
  const { user } = useSelector((state) => state.user);
  console.log(user)
  const [tasks, setTasks] = useState([])
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('recent');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'TODO' });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [viewTask, setViewTask] = useState(null);
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);


  useEffect(() => {

    const fetchTask = async () => {
      try {
        const storedToken = JSON.parse(localStorage.getItem('token'));
        const response = await axios.get("https://voosh-tech-backend.vercel.app/api/user/getTasks", {
        // const response = await axios.get("http://localhost:3000/api/user/getTasks", {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        })
        setTasks(response.data)
      }
      catch (error) {
        console.log(error.message)
      }
    }
    fetchTask();
  }, [user])

  const handleMoveTask = async (task, status) => {
    try {
      const storedToken = JSON.parse(localStorage.getItem('token'));
      await axios.put(`https://voosh-tech-backend.vercel.app/api/user/updateTask/${task._id}`, { ...task, status }, {
      // await axios.put(`http://localhost:3000/api/user/updateTask/${task._id}`, { ...task, status }, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },

      })
      setTasks((prevTask) =>
        prevTask.map((t) => (
          t._id === task._id ? { ...t, status } : t
        ))
      )
    }
    catch (error) {
      console.error(error.message);
    }
  }

  const handleDeleteTask = async (id) => {
    try {
      const storedToken = JSON.parse(localStorage.getItem('token'));
      await axios.delete(`https://voosh-tech-backend.vercel.app/api/user/deleteTask/${id}`, {
      // await axios.delete(`http://localhost:3000/api/user/deleteTask/${id}`, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== id));
      toast.success("Task Deleted Successfully")
    } catch (error) {
      console.error(error.message);
    }
  };

  const confirmDeleteTask = (id) => {
    setTaskToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      toast.error("Title cannot be empty");
      return;
    }
  
    if (!newTask.description.trim()) {
      toast.error("Description cannot be empty");
      return;
    }
    try {
      const storedToken = JSON.parse(localStorage.getItem('token'));
      const response = await axios.post('https://voosh-tech-backend.vercel.app/api/user/createTask', newTask, {
      // const response = await axios.post('http://localhost:3000/api/user/createTask', newTask, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });
      setTasks((prevTasks) => [...prevTasks, response.data]);
      setIsModalOpen(false);
      setNewTask({ title: '', description: '', status: 'TODO' });
      toast.success("Task Created Successfully");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEditTask = async () => {
    if (!taskToEdit.title.trim()) {
      toast.error("Title cannot be empty");
      return;
    }
  
    if (!taskToEdit.description.trim()) {
      toast.error("Description cannot be empty");
      return;
    }
    try {
      const storedToken = JSON.parse(localStorage.getItem('token'));
      const response = await axios.put(`https://voosh-tech-backend.vercel.app/api/user/updateTask/${taskToEdit._id}`, taskToEdit, {
      // const response = await axios.put(`http://localhost:3000/api/user/updateTask/${taskToEdit._id}`, taskToEdit, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task._id === taskToEdit._id ? response.data : task))
      );
      setIsEditModalOpen(false);
      setTaskToEdit(null);
      toast.success("Task Edited Successfully")
    } catch (error) {
      toast.error(error.message);
    }
  };


  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortOrder === 'recent') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    if (source.droppableId !== destination.droppableId) {
      const task = tasks.find(t => t._id === result.draggableId);
      handleMoveTask(task, destination.droppableId);
    }
  };


  const TaskCard = ({ task }) => (
    <div className="task-card">
      <div className="task-card-info">
        <h4>{task.title}</h4>
        <p>{task.description.length > 40 ? `${task.description.substring(0, 100)}...` : task.description}</p>
      </div>
      <p>Created: {new Date(task.createdAt).toLocaleString()}</p>

      <div className='event-buttons'>

        {/* <button className="delete-button" onClick={() => handleDeleteTask(task._id)}>Delete</button> */}
        <button className="delete-button" onClick={() => confirmDeleteTask(task._id)}>Delete</button>
        <button className="edit-button" onClick={() => { setTaskToEdit(task); setIsEditModalOpen(true) }}>Edit</button>
        <button className='view-button' onClick={() => { setViewTask(task); setIsViewDetailsModalOpen(true) }}>View Details</button>
      </div>
    </div>
  );

  const TaskColumn = ({ status, tasks }) => (
    <Droppable droppableId={status}>
      {(provided) => (
        <div className="task-column" {...provided.droppableProps} ref={provided.innerRef}>
          <div className='task-column-heading'>
            <h4>{status}</h4>
          </div>
          {tasks.map((task, index) => (
            <Draggable key={task._id} draggableId={task._id} index={index}>
              {(provided) => (
                <div
                  className="task-item"
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                >
                  <TaskCard task={task} />
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );

  return (
    <>
    <div className="dashboard">
      <div className='dashboard-add-task'>

        <button onClick={() => setIsModalOpen(true)}>Add Task</button>
      </div>
      <div className='dasboard-sub'>
        <div className="dashboard-search">
          <p style={{ marginRight: '5px' }}>Search: </p>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="dashboard-sort">
          <p>Sort By: </p>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="recent">Recent</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="task-board">
          {['TODO', 'IN PROGRESS', 'DONE'].map((status) => (
            <TaskColumn key={status} status={status} tasks={sortedTasks.filter((task) => task.status === status)} />
          ))}
        </div>
      </DragDropContext>

      <Modal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)} className="modal" overlayClassName="overlay" style={{ height: '60vh' }}>
        <h2 style={{ marginBottom: '12px' }}>Add Task</h2>
        <div className="modal-content">
          <div className='modal-title'>
            <p>Title</p>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
          </div>
          <div className='modal-description'>
            <p>Description</p>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
          </div>
        </div>
        <div className="modal-buttons">
          <button className='modal-button1' onClick={handleCreateTask}>Save</button>
          <button className='modal-button22' onClick={() => setIsModalOpen(false)}>Cancel</button>
        </div>
      </Modal>

      <Modal isOpen={isEditModalOpen} onRequestClose={() => setIsEditModalOpen(false)} className="modal" overlayClassName="overlay" style={{ height: '60vh' }}>
        <h2 style={{ marginBottom: '12px' }}>Edit Task</h2>
        <div className="modal-content">
          <div className='modal-title'>
            <p>Title</p>
            <input
              type="text"
              value={taskToEdit?.title || ''}
              onChange={(e) => setTaskToEdit({ ...taskToEdit, title: e.target.value })}
            />
          </div>
          <div className='modal-description'>
            <p>Description</p>
            <textarea
              value={taskToEdit?.description || ''}
              onChange={(e) => setTaskToEdit({ ...taskToEdit, description: e.target.value })}
            />
          </div>
        </div>
        <div className="modal-buttons">
          <button className='modal-button1' onClick={handleEditTask}>Save</button>
          <button className='modal-button2' onClick={() => setIsEditModalOpen(false)}>Cancel</button>
        </div>
      </Modal>

      <Modal isOpen={isViewDetailsModalOpen} onRequestClose={() => setIsViewDetailsModalOpen(false)} className="modal" overlayClassName="overlay" style={{ height: '60vh' }}>
        <h2 style={{ marginBottom: '12px' }}>Task Details</h2>
        <div className="modal-content">
          {viewTask && (
            <div className="modal-content">
              <p style={{ marginBottom: '15px' }}><strong>Title:</strong> <b>{viewTask.title}</b></p>
              <p style={{ display: 'flex', gap: '7px', marginBottom: '15px' }}>
                <p style={{ color: '	#808080' }}>Description:</p>
                <p style={{ color: '#696969' }}>
                  {viewTask.description}
                </p>
              </p>
              <p style={{ display: 'flex', gap: '7px', marginBottom: '15px' }}>
                <p style={{ color: '#808080' }}>Created at:</p>
                <p style={{ color: '#696969' }}>
                  {new Date(viewTask.createdAt).toLocaleString()}
                </p>
              </p>
            </div>
          )}

        </div>
        <div className="modal-buttons">
          <button className='modal-button3' onClick={() => setIsViewDetailsModalOpen(false)}>Close</button>
        </div>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onRequestClose={() => setIsDeleteModalOpen(false)} className="modal-delete" overlayClassName="overlay" style={{ height: '30vh' }}>
        <h2 style={{ marginBottom: '12px' }}>Confirm Delete</h2>
        <div className="modal-content">
          <p>Are you sure you want to delete this task?</p>
        </div>
        <div className="modal-buttons">
          <button className='modal-button11' onClick={() => {
            handleDeleteTask(taskToDelete);
            setIsDeleteModalOpen(false);
          }}>Yes</button>
          <button className='modal-button22' onClick={() => setIsDeleteModalOpen(false)}>No</button>
        </div>
      </Modal>

    </div>
    <ToastContainer />
    </>
  )
}

export default Dashboard