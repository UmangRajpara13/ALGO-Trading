
var r = document.querySelector(':root');

function SwitchTheme(dark) {
    if (dark) {
        r.style.setProperty('--background', "#000000")
        r.style.setProperty('--foreground', "#f5f5f5")
    }
    else {
        r.style.setProperty('--background', "#f5f5f5")
        r.style.setProperty('--foreground', "#000000")

    }

}

export { SwitchTheme }