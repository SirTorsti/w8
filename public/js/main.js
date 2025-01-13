document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    try {
        const response = await fetch("/api/user/login", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({email, password})
        })

        const data = await response.json()
        if(data.error) { 
            console.error("Error: ", data.error)
        } else {
            localStorage.setItem('token', data.token)
   //         window.location.href = '/index.html'
        }
    } catch (error) {
        console.log("error while trying to login" + error.message)
    }
})

document.getElementById('postTopic').addEventListener('click', async function() {
    const title = document.getElementById("topicTitle").value
    const content = document.getElementById("topicText").value

    try{
        const response = await fetch("/api/topic", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({title, content})
        })

        const data = await response.json()
        if(data.error) {
            console.error("Error: ", data.error)
        } else {
            console.log("success: ", data)
            fetchTopics()
        }
    } catch(error) {
        console.log("error while trying to post topic" + error.message)
    }
})

async function fetchTopics() {
    try {
        const response = await fetch ("/api/topics")
        const data = await response.json()

        const topicsDiv = document.getElementById('topics')
        topicsDiv.innerHTML = ""

        data.forEach(topic => {
            const topicDiv = document.createElement('div')
            topicDiv.classList.add('topic')

            const titleSpan = document.createElement('span')
            titleSpan.textContent = topic.title
            topicDiv.appendChild(titleSpan)

            const contentP = document.createElement('p')
            contentP.textContent = topic.content
            topicDiv.appendChild(contentP)

            const info = document.createElement('p')
            info.textContent = `Posted by ${topic.username} on ${new Date(topic.createdAt).toLocaleString()}` 
            topicDiv.appendChild(info)

            const deleteButton = document.createElement('button')
            deleteButton.textContent = "Delete"
            deleteButton.classList.add('btn')
            deleteButton.id = 'deleteTopic'
            deleteButton.addEventListener('click', () => deleteTopic(topic._id))
            topicDiv.appendChild(deleteButton)

            topicsDiv.appendChild(topicDiv)
        })
    } catch (error) {
        console.error('Error fetching topics', error)
    }
}

async function deleteTopic(topicId) {
    try {
        const response = await fetch(`/api/topic/${topicId}`, {
            method: "DELETE",
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })

        const data = await response.json()
        if(data.error) {
            alert(data.error)
        } else {
            fetchTopics()
        }
    } catch (error) {
        console.error('Error deleting topic', error)
    }
}

fetchTopics()