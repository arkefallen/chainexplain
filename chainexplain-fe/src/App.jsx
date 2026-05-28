import React from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import UploadPage from './pages/UploadPage'
import ProcessingPage from './pages/ProcessingPage'
import ResultPage from './pages/ResultPage'
import ErrorPage from './pages/ErrorPage'

const pageTransitionVariants = {
  initial: {
    opacity: 0,
    y: 16,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    y: -16,
    transition: {
      duration: 0.2,
    },
  },
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <motion.div
              variants={pageTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full flex-grow flex flex-col"
            >
              <HomePage />
            </motion.div>
          }
        />
        <Route
          path="/upload"
          element={
            <motion.div
              variants={pageTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full flex-grow flex flex-col"
            >
              <UploadPage />
            </motion.div>
          }
        />
        <Route
          path="/processing"
          element={
            <motion.div
              variants={pageTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full flex-grow flex flex-col"
            >
              <ProcessingPage />
            </motion.div>
          }
        />
        <Route
          path="/result"
          element={
            <motion.div
              variants={pageTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full flex-grow flex flex-col"
            >
              <ResultPage />
            </motion.div>
          }
        />
        <Route
          path="/error"
          element={
            <motion.div
              variants={pageTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full flex-grow flex flex-col"
            >
              <ErrorPage />
            </motion.div>
          }
        />
        {/* Fallback route to redirect to Home */}
        <Route
          path="*"
          element={
            <motion.div
              variants={pageTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full flex-grow flex flex-col"
            >
              <HomePage />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <AnimatedRoutes />
      </Layout>
    </BrowserRouter>
  )
}

export default App
