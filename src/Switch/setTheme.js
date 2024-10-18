




var r = document.querySelector(':root');

function SwitchTheme(dark) {
    if (dark) {
        r.style.setProperty('--background', "#000000")
        r.style.setProperty('--foreground', "#fff")
    }
    else {
        r.style.setProperty('--background', "#fff")
        r.style.setProperty('--foreground', "#000000")
    }

}

export { SwitchTheme }