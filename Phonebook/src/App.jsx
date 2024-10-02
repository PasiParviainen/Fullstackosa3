import { useState, useEffect } from 'react'
import "./App.css"
import bookService from "./services/phonebook"

const App = () => {
  const [persons, setPersons] = useState([])

  const [newName, setNewName] = useState("")

  const [newNumber, setNewNumber] = useState("")

  const [displayPersons, setDisplayPersons] = useState(persons)

  const [errorMessage, setErrorMessage] = useState(null)

  const [notifMessage, setNotifMessage] = useState(null)

  useEffect(() => {
    bookService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
        setDisplayPersons(initialPersons)
      })
  }, [])

  const addName = (event) => {
    event.preventDefault()
    //create person object
    const personObject = {
      name: newName,
      number: newNumber
    }
    //check if there is a person with the same name and number in the table
    if (persons.filter(name => name.name === newName).length > 0 && 
    persons.filter(number => number.number === newNumber).length > 0) {
      setErrorMessage(`"${newName}` + " / " + `${newNumber}" is already in the phonebook.`)
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
    //check if there is a person with the same name in the table
    else if (persons.filter(name => name.name === newName).length > 0) {
      let id = persons.find((person) => {return person.name === newName}).id
      replacePerson(id, newName, personObject)
    }
    //check if there is a person with the same number in the table
    else if (persons.filter(number => number.number === newNumber).length > 0) {
      let id = persons.find((person) => {return person.number === newNumber}).id
      replacePerson(id, newNumber, personObject)
    }
    //if the name and number are unique, add the name and number to the table
    else {
      bookService
        .create(personObject)
        .then(newPerson => {
          console.log("bookService response:", newPerson)
          setPersons(persons.concat(newPerson))
          setDisplayPersons(persons.concat(newPerson))
        })
      setNewName("")
      setNewNumber("")

      setNotifMessage(`Added '${newName}' to the phonebook`)
      setTimeout(() => {
        setNotifMessage(null)
      }, 5000)

      console.log("Added:", newName)
      console.log("personObject:", personObject)
    }
  }

  const replacePerson = (id, toReplace, personObject) => {
    let ok = confirm(toReplace + " is already in the phonebook, do you want to replace the contact?")
      if (ok === true) {
        //korvataan vanha yhteystieto palvelimella
        bookService
          .update(id, personObject)
          .then(updatedPerson => {
            //korvataan vanha yhteystieto persons-taulukossa
            setPersons(persons.map((person) => {
              if (person.id === updatedPerson.id) {
                personObject.id = updatedPerson.id
                return personObject
              }
              else {
                return person
              }
            }))
            //korvataan vanha yhteystieto displayPersons-taulukossa
            setDisplayPersons(persons.map((person) => {
              if (person.id === updatedPerson.id) {
                personObject.id = updatedPerson.id
                return personObject
              }
              else {
                return person
              }
            }))
          })
          setNewName("")
          setNewNumber("")
          
          setNotifMessage(`Replaced '${toReplace}' in the phonebook`)
          setTimeout(() => {
            setNotifMessage(null)
          }, 5000)
        return console.log(`Replaced ${toReplace}`)
      }
  }

  const handleNewName = (event) => {
    event.preventDefault()
    //console.log(event.target.value)
    setNewName(event.target.value)
  }

  const handleNewNumber = (event) => {
    event.preventDefault()
    //console.log(event.target.value)
    setNewNumber(event.target.value)
  }

  const handleSearch = (event) => {
    event.preventDefault()
    //console.log("'" + event.target.value + "'")
    if (event.target.value != "") {
      //Set displayPersons to only include names that include the letters in the search box
      setDisplayPersons(persons
        .filter(search => search.name.toLowerCase()
        .includes(event.target.value.toLowerCase()))
      )
    }
    else {
      //If there is nothing in the search bar, display all names
      setDisplayPersons(persons)
    }
  }

  const handleDelBtn = (event) => {
    let name = persons.find((person) => {return person.id === event}).name
    let ok = confirm(`Are you sure you want to delete "${name}"`)
    if (ok === true) {
      bookService
        .delName(event)
        setPersons(persons.filter(person => person.id != event))
        setDisplayPersons(displayPersons.filter(person => person.id != event))
        setNotifMessage(`Deleted '${name}'.`)
        setTimeout(() => {
          setNotifMessage(null)
        }, 5000)  
    }
  }

  

  return (
    <div>
      <h1>Phonebook</h1>
      <Search handleSearch={handleSearch}/>
      <AddNumber 
        handleNewName={handleNewName} 
        handleNewNumber={handleNewNumber} 
        addName={addName}
        newName={newName}
        newNumber={newNumber}
      />
      <Notif message={notifMessage}/>
      <ErrorNotif message={errorMessage}/>
      <Display displayPersons={displayPersons} handleDelBtn={handleDelBtn}/>
    </div>
  )

}

const Display = (props) => {
  return (
    <table>
    <tbody>
      <tr>
        <th>Name</th>
        <th>Number</th>
        <th></th>
      </tr>
      {props.displayPersons.map(name =>
        <Book handleDelBtn={props.handleDelBtn} person={name} id={name.id} key={name.id}/>
      )}
    </tbody>
  </table>
  )
}

const Book = (props) => {
  //display names and numbers in a table
  return (
      <tr>
        <th>{props.person.name}</th>
        <th>{props.person.number}</th>
        <th>
          <Delete handleDelBtn={props.handleDelBtn} id={props.id}/>
        </th>
      </tr>
  )
}

const Delete = (props) => {
  return (
    <button onClick={() => {props.handleDelBtn(props.id)}} id={props.id}>Delete</button>
  )
}

const Search = (props) => {
  return(
    <div>
      <h2>Search for a name</h2>
          <table>
            <tbody>
              <tr>
                <th>Filter:</th>
                <th><input onChange={props.handleSearch}/></th>
              </tr>
              <tr>
              </tr>
            </tbody>
          </table>
    </div>
  )
}

const AddNumber = (props) => {
  return (
    <div>
    <h2>Add New Number</h2>
    <form onSubmit={props.addName}>
      <table>
        <tbody>
          <tr>
            <th>Name:</th>
            <th><input value={props.newName} onChange={props.handleNewName}/></th>
          </tr>
          <tr>
            <th>Number:</th>
            <th><input value={props.newNumber} onChange={props.handleNewNumber}/></th>
          </tr>
          <tr>
            <th><button type="submit">Add</button></th>
          </tr>
        </tbody>
      </table>
    </form>
  </div>
  )
}

const Notif = ({message}) => {
  if (message === null) {
    return null
  }

  return (
    <div className="notif">
      <p>{message}</p>
    </div>
  )
}

const ErrorNotif = ({message}) => {
  if (message === null) {
    return null
  }

  return (
    <div className="error">
      <p>{message}</p>
    </div>
  )
}
export default App