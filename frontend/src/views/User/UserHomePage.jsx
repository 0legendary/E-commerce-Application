import React, { useEffect, useState } from 'react'
import './userdesign.css'
import axiosInstance from '../../config/axiosConfig'
import { useNavigate } from 'react-router-dom'
import { formatDate } from '../../config/authenticateCondition.js'

function UserHomePage() {
  const [user, setUser] = useState({})

  const navigate = useNavigate()

  useEffect(() => {
    
    axiosInstance.post('/user/get-user')
      .then((res) => {
        if (res.status === 200) {
          setUser(res.data)
        } else {
          navigate('/authentication')
        }

      }).catch(() => navigate('/authentication'))

  }, [navigate])

  return (
    <div className='user-home-page'>
      {user && (
        <div>
          <h1>Welcome back {user.username}</h1>
          <p className='text-center'>You created this account on {formatDate(user.createdAt)}</p>
        </div>

      )}
    </div>
  )
}

export default UserHomePage
