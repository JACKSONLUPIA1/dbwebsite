// global vars
const modalWrapper = document.querySelector('.modal-wrapper');
const addModal = document.querySelector('.add-modal');
const addModalForm = document.querySelector('.add-modal .form');
const editModal = document.querySelector('.edit-modal');
const editModalForm = document.querySelector('.edit-modal .form');
const statusModal = document.querySelector('.status-modal');
const statusModalForm = document.querySelector('.status-modal .form');
const btnAdd = document.querySelector('.btn-add');
const tableUsers = document.querySelector('.table-users');

let id;

// render text
const renderUser = doc => {
  // console.log(doc.data().progress);
  // 0 - open
  // 1 - inprogress
  // 2 - completed

  let statusVar;
  let statusVarText;


  switch(doc.data().progress) {
    case '0':
      // console.log('open');
      statusVar = 'open';
      statusVarText = 'Open';
      break;
    case '1':
      // console.log('inprogress');
      statusVar = 'inprogress';
      statusVarText = 'In Progress';
      break;
    case '2':
      // console.log('completed');
      statusVar = 'completed';
      statusVarText = 'Completed';
      break;
    default:
      console.log("unknown request, defaulted to 'Open'");
      statusVar = 'open';
      statusVarText = 'Open';
    }


  const tr = `
    <tr data-id='${doc.id}'>
      <td>${doc.data().firstName}</td>
      <td>${doc.data().lastName}</td>
      <td>${doc.data().email}</td>
      <td>${doc.data().message}</td>
      <td>
        <button class="btn btn-edit">Edit</button>
        <button class="btn btn-delete">Delete</button>
        <button class="btn btn-status-${statusVar}">${statusVarText}</button>
      </td>
    </tr>
  `;
  tableUsers.insertAdjacentHTML('beforeend', tr);

  // edit
  const btnEdit = document.querySelector(`[data-id='${doc.id}'] .btn-edit`);
  btnEdit.addEventListener('click', () => {
    editModal.classList.add('modal-show');
    id = doc.id;
    editModalForm.firstName.value = doc.data().firstName;
    editModalForm.lastName.value = doc.data().lastName;
    editModalForm.message.value = doc.data().message;
    editModalForm.email.value = doc.data().email;
    editModalForm.progress.value = doc.data().progress;
  });

  // // change status - here
  // const btnStatus = document.querySelector(`[data-id='${doc.id}'] .btn-status`);
  // btnStatus.addEventListener('click', () => {
  //   statusModal.classList.add('modal-show');
  //   editModalForm.progress.value = doc.data().progress;
  //   console.log(editModalForm.progress.value);
  // });


  // delete user
  const btnDelete = document.querySelector(`[data-id='${doc.id}'] .btn-delete`);
  btnDelete.addEventListener('click', () => {
    db.collection('users').doc(`${doc.id}`).delete().then(() => {
      console.log('Document deleted, Refresh Page to Update');
    }).catch(err => {
      console.log('Error removing document', err);
    });
  });
}

// add button
btnAdd.addEventListener('click', () => {
  addModal.classList.add('modal-show');
  addModalForm.firstName.value = '';
  addModalForm.lastName.value = '';
  addModalForm.message.value = '';
  addModalForm.email.value = '';
});

//click out window
window.addEventListener('click', e => {
  if(e.target === addModal) {
    addModal.classList.remove('modal-show');
  }
  if(e.target === editModal) {
    editModal.classList.remove('modal-show');
  }
  if(e.target === statusModal) {
    statusModal.classList.remove('modal-show');
  }
});

// update realtime/ get vars
db.collection('users').onSnapshot(snapshot => {
  snapshot.docChanges().forEach(change => {
    if (change.type === "added") {
      renderUser(change.doc);
    }
    if (change.type === "removed") {
      let tr = document.querySelector(`[data-id='${change.doc.id}']`);
      let tbody = tr.parentElement;
      tableUsers.removeChild(tbody);
      renderUser(change.doc);
    }
    if (change.type === "modified") {
      let tr = document.querySelector(`[data-id='${change.doc.id}']`);
      let tbody = tr.parentElement;
      tableUsers.removeChild(tbody);
      renderUser(change.doc);
    }
  });
});

// submit button
addModalForm.addEventListener('submit', e => {
  e.preventDefault();
  db.collection('users').add({
    firstName: addModalForm.firstName.value,
    lastName: addModalForm.lastName.value,
    message: addModalForm.message.value,
    email: addModalForm.email.value,
    progress: 0
  });
  modalWrapper.classList.remove('modal-show');
});

// submit button edit
editModalForm.addEventListener('submit', e => {
  e.preventDefault();
  db.collection('users').doc(id).update({
    firstName: editModalForm.firstName.value,
    lastName: editModalForm.lastName.value,
    message: editModalForm.message.value,
    email: editModalForm.email.value,
    progress: editModalForm.progress.value
  });
  editModal.classList.remove('modal-show');
});

// statusModalForm.addEventListener('submit', e => {
//   console.log(statusModalForm.progress.value);
//   e.preventDefault();
//   db.collection('users').doc(id).update({
//     progress: statusModalForm.progress.value
//   });
//   statusModalForm.classList.remove('modal-show');
// });
