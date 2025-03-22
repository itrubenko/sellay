(function(){
    const profileForm = document.getElementById('profile');
    $(profileForm).on('submit', async function (e) {
        e.preventDefault();
        var formData = new FormData(profileForm);
        let request = await fetch('http://localhost:3000/update', {
            method: 'POST',
            body: formData
        });

        var result = await request.json();
        console.log(result);
    });

    fetch('http://localhost:3000/profile')
        .then(data => data.json())
        .then(data => {
            profileForm.name.value = data.name;
            profileForm.surname.value = data.surname;
        });
})($);
