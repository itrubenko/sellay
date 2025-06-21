(function(){
    const profileForm = document.getElementById('profile');
    $(profileForm).on('submit', async function (e) {
        e.preventDefault();
        var formData = new FormData(profileForm);
        let request = await fetch('/update', {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'multipart/form-data'
            },
        });

        var result = await request.json();
        console.log(result);
    });

    fetch('/profile')
        .then(data => data.json())
        .then(data => {
            profileForm.name.value = data.name;
            profileForm.surname.value = data.surname;
        })

    const form = document.getElementById("form");
    const inputFile = document.getElementById("file");

    const formData = new FormData();

    const handleSubmit = (event) => {
        event.preventDefault();

        for (const file of inputFile.files) {
            formData.append("files", file);
        }

        fetch("/files", {
            method: "post",
            body: formData,
        }).catch((error) => ("Something went wrong!", error));
    };

    form.addEventListener("submit", handleSubmit);
})($);
