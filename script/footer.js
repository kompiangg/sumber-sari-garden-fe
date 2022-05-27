const footer = document.querySelector("footer")

let link = document.createElement("link");
link.href = '/style/footer.css';
link.type = "text/css";
link.rel = "stylesheet";
link.media = "screen,print";
footer.appendChild(link)

let container = document.createElement("div")
container.className = "container"
container.innerHTML = `
<div class="row">
    <div class="col-md">
        <h4>CONTACT US</h4>
        <ul class="contact-us">
            <li>
                <div class="base-icon">
                    <img src="./assets/icon/Compass.svg" alt="Compass">
                </div>
                <div>
                    <h5>Address</h5>
                    <a href="https://goo.gl/maps/wSCfTdCRd8zUr9jU8">Jalan bla bla, Denpasar, Bali</a>
                </div>
            </li>
            <li>
                <div class="base-icon">
                    <img src="./assets/icon/Email.svg" alt="Email">
                </div>
                <div>
                    <h5>Email us</h5>
                    <a href="mailto:sumbersarigarden@gmail.com">sumbersarigarden@gmail.com</a>
                </div>
            </li>
            <li>
                <div class="base-icon">
                    <img src="./assets/icon/Phone Call.svg" alt="Phone Call">
                </div>
                <div>
                    <h5>Call us</h5>
                    <a href="tel:(0361) 123123">(0361)123123</a>
                </div>
            </li>
        </ul>
    </div>

    <div class="col-md">
        <h4>MAIN MENU</h4>
        <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">Order</a></li>
            <li><a href="#">Promotion</a></li>
        </ul>
    </div>

    <div class="col-md">
        <h4>OPENING TIME</h4>
        <ul class="opening-time">
            <li>
                <p>Monday - Friday</p>
                <p>08:00 - 17:00</p>
            </li>
            <li>
                <p>Saturday</p>
                <p>08:00 - 15:00</p>
            </li>
            <li>
                <p>Sunday</p>
                <p>Day Off</p>
            </li>
        </ul>
    </div>
</div>
`
footer.appendChild(container)