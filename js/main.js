let i = 0;
let currentimage = "";
let images = [];
let imgfiles = [];
let imgdetails = {};
let name = '',
    desc = '',
    loc = '';
let divs = {
    1: "one",
    2: "two",
    3: "three",
    4: "four"
};
let showing = false;
let editloc = 5;
let uid = '';
let saved = true;
const imageCompressor = new ImageCompressor();


$(document).ready(() => {

    auth.onAuthStateChanged(function (user) {
        if (user) {
            uid = user.uid;

            console.log('logged in', user.uid);

            $('#logout').attr('title', user.email);

        } else {
            console.log('logged out');
            window.location = "/";
        }
    });

    $('.bd-example-modal-lg').on('show.bs.modal', function (event) {

        let image = $(event.relatedTarget);
        let url = image.data('whatever');
        let modal = $(this);
        $('#largeImage').attr('src', url);
    });

    $("#currentimage").change(() => {
        // console.log($("#currentimage"));
        // console.log($("#currentimage")[0].files[0]);
        // console.log(document.getElementById("currentimage").files);

        if ($("#currentimage")[0].files[0]) {
            let image;
            var reader = new FileReader();
            reader.onload = function (e) {
                image = e.target.result;
                if (images.indexOf(image) < 0) {
                    images.push(image);
                    imgfiles.push($("#currentimage")[0].files[0]);
                    i++;
                    currentimage = image;
                    if (i > 4) {
                        $('.action .addanother').html('Save');
                    }
                    progress(image);
                    saved = false;
                }
            }
            reader.readAsDataURL($("#currentimage")[0].files[0]);
        }

    });

    $(".progress img").click(function (e) {
        //do something
        e.stopPropagation();
    })

});

function progress(image) {
    $('h2').css('display', 'none');
    $('.places').css('display', 'flex');
    $('.progress div').css('display', 'none');
    $('.progress').css('background', `url('${image}')`);
    // $('.progress').animate({'background':`url('${image}'`},1000);
    $('.progress').css('background-repeat', `no-repeat`);
    $('.progress').css('background-position', `center`);
    $('.progress').css('background-size', `cover`);
    $('.progress img').css('display', 'block');
    $('.action button').removeClass('disabled');
    $('.action .addanother').attr('onclick', 'addanother()');

    $('.action .submit').attr('onclick', 'submit()');
    $('.progress').attr('data-toggle', 'modal');
    $('.progress').attr('data-target', '.bd-example-modal-lg');
    $('.progress').attr('data-whatever', `${image}`);
    $('.progress').removeAttr('onclick');
}

function selectimage() {
    document.getElementById("currentimage").click();
}

function addanother() {
    let pos = i;
    if (i < 5 && showing) {
        pos = editloc;
    }

    // console.log(imgdetails);

    name = $('#name').val();
    desc = $('#description').val();
    loc = $('#location').val();
    if (name == '' || desc == '' || loc == '') {
        $('.places p').css('display', 'block');
    } else {
        imgdetails[pos] = {
            name: name,
            description: desc,
            city: loc
        };
        saved = true;
        console.log(imgdetails);
        if (i < 5) {
            changeprogressdiv(currentimage, pos);
            reset();
        }

    }
}

function changeprogressdiv(backimg, posi) {
    $(`.${divs[posi]}`).css('background', `url('${backimg}')`);
    $(`.${divs[posi]}`).css('background-repeat', `no-repeat`);
    $(`.${divs[posi]}`).css('background-position', `center`);
    $(`.${divs[posi]}`).css('background-size', `cover`);
    $(`.${divs[posi]}`).attr('onclick', `show('${posi}')`);
    currentimage = "";
}

function reset() {
    $('h2').css('display', 'block');
    $('.places').css('display', 'none');
    $('.progress div').css('display', 'flex');
    $('.progress').css('background', '#ffffff');
    $('.progress img').css('display', 'none');
    $('.action .addanother').addClass('disabled');
    $('.action .addanother').removeAttr('onclick');
    $('.progress').removeAttr('data-toggle');
    $('.progress').removeAttr('data-target');
    $('.progress').removeAttr('data-whatever');
    $('.progress').attr('onclick', 'selectimage()');
    $('input').val('');
    showing = false;
    editloc = 5;
}

function show(pos) {

    // console.log(images);

    let tmp;
    if (currentimage != "") {
        tmp = currentimage;
        addanother();
    }
    editloc = pos;
    showing = true;
    currentimage = images[pos - 1];
    let details = imgdetails[pos];
    progress(currentimage);
    $('#name').val(details.name);
    $('#description').val(details.description);
    $('#location').val(details.city);
    if (i == 5) {
        $(`.${divs[pos]}`).css('background', `url('${tmp}')`);
        $(`.${divs[pos]}`).css('background-position', `center`);
        $(`.${divs[pos]}`).css('background-repeat', `no-repeat`);
        $(`.${divs[pos]}`).css('background-size', `cover`);
        images[pos - 1] = tmp;
        images[4] = currentimage;
        imgdetails[pos] = imgdetails[5];
        imgdetails[5] = details;
        tmp = imgfiles[pos];
        imgfiles[pos] = imgfiles[5];
        imgfiles[5] = tmp;
    }
}

function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function submit() {
    if (!saved)
        addanother();

    let t = 0;

    function forEachPromise(items, fn, imgDetail) {
        return Array.from(items).reduce(function (promise, item) {
            return promise.then(function () {
                return fn(item, imgDetail);
            });
        }, Promise.resolve());
    }

    function logItem(element, detail) {
        return new Promise((resolve, reject) => {
            // console.log(element);
            var imgFile = imgfiles[t];
            let pushedPlace = placesNotApproved.push().key;

            let data = detail[t + 1];

            data['uid'] = uid;

            let name = uuidv4();
            t++;
            return placesNotApproved.child(pushedPlace).update(data).then(() => {
                return imageCompressor.compress(imgFile, 0.2)
                    .then(function (result) {
                        return uploadImageAsPromise(result, pushedPlace, false, name, placesNotApproved);
                    })
                    .then(() => {
                        return uploadImageAsPromise(imgFile, pushedPlace, true, name, placesNotApproved);
                    })
                    .then(() => {
                        resolve();
                    })
                    .catch((err) => {
                        // Handle the error
                        console.log(`Error ${err}`);
                    });
            });

        });
    }


    return forEachPromise(imgfiles, logItem, imgdetails).then(() => {
        console.log('all images done');
        alert('all images done');
    });
}

function uploadImageAsPromise(imageFile, pushedPlaceKey, highRes, name, database) {
    return new Promise(function (resolve, reject) {
        var storageRef;

        if (highRes) {
            storageRef = firebase.storage().ref('images/' + pushedPlaceKey + "/highres/" + name + '.jpg');
        } else {
            storageRef = firebase.storage().ref('images/' + pushedPlaceKey + "/lowres/" + name + '.jpg');
        }

        //Upload file
        var task = storageRef.put(imageFile);

        //Update progress bar
        task.on('state_changed',
            function progress(snapshot) {
                var percentage = snapshot.bytesTransferred / snapshot.totalBytes * 100;
                console.log(percentage);
            },
            function error(err) {
                console.log(`Error ${err}`);

            },
            function complete() {
                var downloadURL = task.snapshot.downloadURL;
                console.log(task.snapshot);
                console.log(task.snapshot.metadata.name);
                let data = {
                    name: task.snapshot.metadata.name,
                    url: task.snapshot.downloadURL
                };
                console.log("Upload done");
                if (highRes) {
                    database.child(pushedPlaceKey).child("images").child("highres").push(data);
                } else {
                    database.child(pushedPlaceKey).child("images").child("lowres").push(data);
                }
                resolve();
            }
        );
    });
}

function del() {

    if (i < 5 && showing) {
        let t = 0;
        for (t = editloc; t < images.length;) {
            console.log(imgdetails[t]);

            changeprogressdiv(images[t],t);

            imgdetails[t] = imgdetails[++t];
            console.log(imgdetails[t]);
            console.log(imgdetails);
        }
        images.splice(editloc - 1, 1);
        delete imgdetails[t];
        $(`.${divs[t]}`).css('background', `#ffffff`);
        $(`.${divs[t]}`).removeAttr("onclick");
    } else if (i == 5 && saved) {
        images.splice(editloc - 1, 1);
        delete imgdetails[editloc];
    } else
        images.splice(i - 1);
    
    i--;
    reset();
}