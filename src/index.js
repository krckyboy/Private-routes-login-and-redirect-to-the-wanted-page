import React, { Component } from "react"
import ReactDOM from "react-dom"
import {
  BrowserRouter as Router,
  NavLink,
  Route,
  Redirect,
  withRouter
} from "react-router-dom"
import "./styles.css"

const fakeAuth = {
  isAuthenticated: false,
  authenticate(cb) {
    this.isAuthenticated = true
    setTimeout(cb, 100) // fake async
  },
  signout(cb) {
    this.isAuthenticated = false
    setTimeout(cb, 100)
  }
}

const Public = () => <h3>Public</h3>
const Protected = () => <h3>Protected</h3>

/* Receives previous route path as prop 'from' */
class Login extends Component {
  state = {
    redirectToReferrer: false
  }
  onClick = () => {
    fakeAuth.authenticate(() => this.setState({ redirectToReferrer: true }))
  }
  render() {
    const { redirectToReferrer } = this.state
    const { from } = this.props.location.state || { from: { pathname: "/" } }

    if (redirectToReferrer) {
      return <Redirect to={from} />
    }

    return (
      <div>
        <h2>You must log in to view this page.</h2>
        <button onClick={this.onClick}>Log me in</button>
      </div>
    )
  }
}

/* Our own custom private route:
  In the Redirect, we're sending the url of the current route
  before we actually redirect to login, so we can go back
  to that route after logging in.
  
  If user is authenticated already, then we just render the 
  Component through a route, passing in the props (...rest) 
  down to the Route, and then again from the rendered component
  to the Component. 
  
  1. It has the same API as <Route />.
  2. It renders a <Route /> and passes all the props through to it.
  3. It checks if the user is authenticated, if they are, it renders
  the “component” prop. If not, it redirects the user to /login.*/
const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      fakeAuth.isAuthenticated ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{
            pathname: "/login",
            state: { from: props.location }
          }}
        />
      )
    }
  />
)

const AuthButton = withRouter(({ history }) =>
  fakeAuth.isAuthenticated ? (
    <p>
      Welcome!{" "}
      <button onClick={() => fakeAuth.signout(() => history.push("/"))}>
        Sign out
      </button>
    </p>
  ) : (
    <p>You are not logged in.</p>
  )
)

function App() {
  return (
    <Router>
      <div className="App">
        <AuthButton />
        <ul>
          <li>
            <NavLink to="/public">Public Page</NavLink>
          </li>
          <li>
            <NavLink to="/protected">Protected Page</NavLink>
          </li>
        </ul>
        <Route path="/public" component={Public} />
        <Route path="/login" component={Login} />
        <PrivateRoute path="/protected" component={Protected} />
      </div>
    </Router>
  )
}

const rootElement = document.getElementById("root")
ReactDOM.render(<App />, rootElement)
