
var r = document.querySelector(':root');

function SwitchTheme(dark) {
    if (dark) {
        r.style.setProperty('--background', "#000000")
        r.style.setProperty('--foreground', "#f5f5f5")
        r.style.setProperty('--trade_config_grey', "#3f463e")
    }
    else {
        r.style.setProperty('--background', "#f5f5f5")
        r.style.setProperty('--foreground', "#000000")
        r.style.setProperty('--trade_config_grey', "#c7dcdfef")

    }

}

export { SwitchTheme }