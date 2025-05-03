setTimeout(function() {
    $('body').on('submit', '.profile', async function (e) {
        e.preventDefault();
        var formData = new FormData(this);
        let request = await fetch('users/register',{
              headers: {
                "Content-Type": "application/json",
            },
            method: 'POST',
            body: JSON.stringify(Object.fromEntries(formData))
        });

        var result = await request.json();
        console.log(result);
    });

    $('body').on('submit', '.profile1', async function (e) {
        e.preventDefault();
        var formData = new FormData(this);
        let request = await fetch('users/login',{
              headers: {
                "Content-Type": "application/json",
            },
            method: 'POST',
            body: JSON.stringify(Object.fromEntries(formData))
        });

        var result = await request.json();
        if (result.user) {
            window.location.assign('users/profile')
        }
        console.log(result);
    });
}, 2000)