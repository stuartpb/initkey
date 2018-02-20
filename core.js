/* global forge Blob URL */
"use strict";

const elid = document.getElementById.bind(document);
let generatedKeypair;

function generateKeypair(bitlength, comment) {
  return new Promise((resolve, reject) =>
    forge.pki.rsa.generateKeyPair({bits: bitlength, workers: -1},
      (err, keypair) => {
        if (err) {
          return reject(err);
        } else {
          keypair.comment = comment;
          return resolve(keypair);
        }
      }));
}

function displayGeneratingSpinner() {
  elid('progress').hidden = false;
  elid('key-parts').hidden = true;
}

function togglePrivateKeyVisibility(forceOff) {
  const privateKeyElement = elid('private-key');
  if (privateKeyElement.hidden && !forceOff) {
    privateKeyElement.hidden = false;
    privateKeyElement.textContent =
      forge.ssh.privateKeyToOpenSSH(generatedKeypair.privateKey);
    elid('show-private').textContent = 'Hide private key';
  } else {
    privateKeyElement.hidden = true;
    privateKeyElement.textContent = '';
    elid('show-private').textContent = 'Show private key';
  }
}

elid('show-private').addEventListener('click',
  e => togglePrivateKeyVisibility());

function fitContentHeight(element) {
  element.style.height = 'auto';
  element.style.height = (element.scrollHeight) + 'px';
}

function displayKeypair(keypair) {
  generatedKeypair = keypair;
  elid('progress').hidden = true;
  elid('key-parts').hidden = false;

  elid('fingerprint').textContent =
    forge.ssh.getPublicKeyFingerprint(keypair.publicKey,
      {encoding: 'hex', delimiter: ':'});
  elid('pubkey').value =
    forge.ssh.publicKeyToOpenSSH(keypair.publicKey, keypair.comment);
  fitContentHeight(elid('pubkey'));
  elid('save-private').href = URL.createObjectURL(new Blob([
    forge.ssh.privateKeyToOpenSSH(keypair.privateKey)]));
  elid('save-public').href = URL.createObjectURL(new Blob([
    elid('pubkey').value]));

  togglePrivateKeyVisibility(true);
}

function submitKeypairParameters(evt) {
  displayGeneratingSpinner();
  generateKeypair(+elid('bitlength').value, elid('comment').value)
    .then(displayKeypair);
  return evt.preventDefault();
}

elid('parameters').addEventListener('submit', submitKeypairParameters);
