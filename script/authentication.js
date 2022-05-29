import config from "./util/config.js";
import errorHandling from "./util/errorHandling.js";
import util from "./util/util.js";

const redirectToRegisterButton = document.getElementById('signUp');
const redirectToLoginButton = document.getElementById('signIn');
const container = document.getElementById('container');

const loginButton = document.getElementById('action-login')
const registerButton = document.getElementById('action-register')

const params = new URLSearchParams(window.location.search)

if (params.get("register") == 1) {
	container.classList.toggle("right-panel-active")
}

redirectToRegisterButton.addEventListener('click', () => {
	container.classList.add("right-panel-active");
});

redirectToLoginButton.addEventListener('click', () => {
	container.classList.remove("right-panel-active");
});

loginButton.addEventListener('click', async (event) => {
	event.preventDefault()

	const form = document.getElementById('login-form')

	let valid = formValidation("login", form)

	if (valid != true) {
		return
	}

	const data_profile = {
		"email": form.elements['login__email'].value.trim(),
		"password": form.elements['login__password'].value.trim(),
	}

	const payload = JSON.stringify(data_profile)

	const sendLogin = await util.FetchAuth('/auth/login', payload)

	if (sendLogin.error != null) {
		errorHandling.PrintError(sendLogin.error)
		return
	}

	util.SetLocalStorageLogin(sendLogin.data)

	window.location.href = "index.html"
})

registerButton.addEventListener("click", async (event) => {
	event.preventDefault()

	const form = document.getElementById("register-form")

	let valid = formValidation("register", form)

	if (valid != true) {
		return
	}

	const data_profile = {
		first_name: form['register__first-name'].value.trim(),
		last_name: form['register__last-name'].value.trim(),
		phone: form['register__phone'].value.trim(),
		address: form['register__address'].value.trim(),
		email: form['register__email'].value.trim(),
		password: form['register__password'].value.trim(),
	}

	const payload = JSON.stringify(data_profile)

	const sendRegister = await util.FetchAuth('/auth/register', payload)

	if (sendRegister.error != null) {
		errorHandling.PrintError(sendRegister.error)
		return
	}

	// Login
	const payloadLogin = JSON.stringify({
		email: data_profile.email,
		password: data_profile.password,
	})

	const sendLogin = await util.FetchAuth('/auth/login', payloadLogin)

	if (sendLogin.error != null) {
		errorHandling.PrintError(sendLogin.error.message)
		return
	}

	util.SetLocalStorageLogin(sendLogin.data)

	window.location.href = "index.html"
})

function showMessage(input, message, type) {
	const name = input.name
	const msg = input.parentNode.querySelector(`small.${name}`)

	msg.innerText = message
	input.className = type ? "success-validation" : "error-validation"
	msg.className = type ? "success-validation" : "error-validation"
	return type
}

function hasValue(input, message) {
	if (input.value.trim() === "") {
		return showMessage(input, message, false)
	}
	return showMessage(input, "", true)
}

function formValidation(sectionValidation, form) {
	if (sectionValidation == "login") {
		let emailValid = hasValue(form['login__email'], "*Please enter your email")
		let passwordValid = hasValue(form['login__password'], "*Please enter your password")

		if (emailValid && passwordValid) {
			return true
		}
		return false
	} else if (sectionValidation == "register") {
		let firstNameValid = hasValue(form['register__first-name'], "*Please enter your first name")
		let lastNameValid = hasValue(form['register__last-name'], "*Please enter your last name")
		let phoneValid = hasValue(form['register__phone'], "*Please enter your phone number")
		let addressValid = hasValue(form['register__address'], "*Please enter your address")
		let emailValid = hasValue(form['register__email'], "*Please enter your email")
		let passwordValid = hasValue(form['register__password'], "*Please enter your password")

		if (firstNameValid &&
			lastNameValid &&
			phoneValid &&
			addressValid &&
			emailValid &&
			passwordValid) {
			return true
		}
		return false
	}
}