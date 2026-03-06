import {Link} from 'react-router-dom'

const Home = () => {
  localStorage.setItem('page', 1);
  return (
    <div className="w-full h-screen flex items-center justify-center animate-bg text-white text-center px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
          Welcome to <span className="text-cyan-400">Eventora</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl mb-8">
          Your one-stop hub for <span className="font-semibold">exciting events</span> — meet, explore, and experience like never before!
        </p>
        <Link to='/events' className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition duration-300">
          Explore Events
        </Link>
      </div>
    </div>
  )
}

export default Home