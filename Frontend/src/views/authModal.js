import { api } from '../api.js';
import { state, setNotification } from '../state.js';

export function renderAuthModal(modalContainer, router, onLoginSuccess) {
  let isRegister = false;

  function update() {
    modalContainer.innerHTML = `
      <div class="fixed inset-0 bg-primary/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div class="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-md w-full p-space-lg flex flex-col gap-space-md border border-surface-container relative animate-in fade-in zoom-in duration-200">
          <!-- Logo & Brand Header -->
          <div class="flex items-center gap-space-sm mb-1">
            <img alt="CardioCheck Logo" class="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AEtjO1VKh25hZk2v8Vo1rb1uASLLszwhPOqiOf6NEWOFEWsfvJzekWZxHmYi-jWXpulUDNsDSFSZplDNhTeBqmhSTOAgLgBw78ovrIbMnI22YrM_I_qTy4CurkufzXfRoXZ0KD8Jkl2Z-Sr9OOZCeuxVc_WKrax8msxO3UGNZKfTszg-kXdcBpEyWAe2gxMwKQ5k_r-zlW1msMswZc1nNR6GoDRSpj5CX41WAD8ev7ApnesJK7DLh8IvJOlUiF8"/>
            <div class="flex flex-col leading-tight">
              <span class="font-headline-md text-headline-md text-primary tracking-tight">CardioCheck</span>
              <span class="font-label-ui text-label-ui text-on-surface-variant uppercase">Physician Authentication</span>
            </div>
          </div>

          <div class="flex flex-col">
            <h2 class="font-headline-lg text-headline-lg text-primary">${isRegister ? 'Create Doctor Account' : 'Physician Sign In'}</h2>
            <p class="font-body-sm text-body-sm text-on-surface-variant">
              ${isRegister ? 'Register your clinical credentials to access diagnostic triage models.' : 'Enter your clinical credentials to access patient records and inference tools.'}
            </p>
          </div>

          <!-- Quick Demo Sign-in Banner -->
          ${!isRegister ? `
            <div class="p-space-sm rounded-lg bg-surface-container-low border border-secondary/20 flex flex-col gap-1.5">
              <div class="flex items-center justify-between">
                <span class="font-label-ui text-label-ui text-secondary font-semibold uppercase">Demonstration Quick Access</span>
                <span class="px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-container font-label-data-sm text-[11px] font-bold">READY</span>
              </div>
              <p class="font-body-sm text-body-sm text-on-surface-variant">Default physician account pre-configured with Cleveland dataset records.</p>
              <button id="quickFillDemoBtn" class="w-full py-2 bg-secondary text-on-secondary rounded-lg font-label-ui text-label-ui hover:bg-on-secondary-container transition-colors font-semibold" type="button">
                One-Click Sign In (Dr. Sarah Jenkins)
              </button>
            </div>
          ` : ''}

          <!-- Auth Form -->
          <form id="authForm" class="space-y-3">
            ${isRegister ? `
              <div>
                <label class="block font-label-ui text-label-ui text-on-surface mb-1">Full Name & Title</label>
                <input id="authName" class="w-full px-3 py-2 bg-surface rounded-lg text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-container-low border border-surface-container transition-all" placeholder="Dr. Sarah Jenkins, MD" required type="text"/>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block font-label-ui text-label-ui text-on-surface mb-1">Department</label>
                  <input id="authDept" class="w-full px-3 py-2 bg-surface rounded-lg text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-container-low border border-surface-container transition-all" placeholder="Cardiology Dept" type="text" value="Cardiology Dept"/>
                </div>
                <div>
                  <label class="block font-label-ui text-label-ui text-on-surface mb-1">License #</label>
                  <input id="authLicense" class="w-full px-3 py-2 bg-surface rounded-lg text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-container-low border border-surface-container transition-all" placeholder="MD-98241-OH" type="text" value="MD-98241-OH"/>
                </div>
              </div>
            ` : ''}

            <div>
              <label class="block font-label-ui text-label-ui text-on-surface mb-1">Hospital Email</label>
              <input id="authEmail" class="w-full px-3 py-2 bg-surface rounded-lg text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-container-low border border-surface-container transition-all" placeholder="doctor@cardiocheck.io" required type="email" value="${isRegister ? '' : 'doctor@cardiocheck.io'}"/>
            </div>

            <div>
              <label class="block font-label-ui text-label-ui text-on-surface mb-1">Password</label>
              <input id="authPassword" class="w-full px-3 py-2 bg-surface rounded-lg text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-container-low border border-surface-container transition-all" placeholder="••••••••" required type="password" value="${isRegister ? '' : 'CardioCheck2026!'}"/>
            </div>

            <div id="authErrorMsg" class="hidden p-2 rounded bg-error-container text-on-error-container font-body-sm text-body-sm"></div>

            <button id="authSubmitBtn" class="w-full mt-2 py-2.5 bg-primary text-on-primary rounded-lg font-headline-md text-headline-md hover:bg-primary-container transition-colors shadow-sm font-semibold" type="submit">
              ${isRegister ? 'Register Physician Account' : 'Sign In to Workspace'}
            </button>
          </form>

          <div class="flex items-center justify-between text-body-sm text-body-sm text-on-surface-variant pt-2 border-t border-surface-container">
            <span>${isRegister ? 'Already registered?' : 'Need clinical access?'}</span>
            <button id="toggleAuthModeBtn" class="font-label-ui text-label-ui text-secondary hover:underline font-semibold" type="button">
              ${isRegister ? 'Sign In Instead' : 'Register New Doctor'}
            </button>
          </div>
        </div>
      </div>
    `;

    // Listeners
    modalContainer.querySelector('#toggleAuthModeBtn')?.addEventListener('click', () => {
      isRegister = !isRegister;
      update();
    });

    modalContainer.querySelector('#quickFillDemoBtn')?.addEventListener('click', async () => {
      try {
        setNotification('Signing in as Dr. Sarah Jenkins...', 'info');
        const res = await api.login('doctor@cardiocheck.io', 'CardioCheck2026!');
        state.doctor = res.doctor;
        modalContainer.innerHTML = '';
        setNotification('Signed in successfully.', 'success');
        if (onLoginSuccess) onLoginSuccess();
      } catch (err) {
        showError(err.message);
      }
    });

    modalContainer.querySelector('#authForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = modalContainer.querySelector('#authEmail').value.trim();
      const password = modalContainer.querySelector('#authPassword').value;
      const errorDiv = modalContainer.querySelector('#authErrorMsg');
      errorDiv.classList.add('hidden');

      const submitBtn = modalContainer.querySelector('#authSubmitBtn');
      const origText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Authenticating...';

      try {
        let res;
        if (isRegister) {
          const fullName = modalContainer.querySelector('#authName').value.trim();
          const dept = modalContainer.querySelector('#authDept').value.trim();
          const license = modalContainer.querySelector('#authLicense').value.trim();
          res = await api.register({ email, password, full_name: fullName, department: dept, license_number: license });
        } else {
          res = await api.login(email, password);
        }

        state.doctor = res.doctor;
        modalContainer.innerHTML = '';
        setNotification(`Welcome back, ${res.doctor.full_name}`, 'success');
        if (onLoginSuccess) onLoginSuccess();
      } catch (err) {
        showError(err.message);
        submitBtn.disabled = false;
        submitBtn.textContent = origText;
      }
    });

    function showError(msg) {
      const errBox = modalContainer.querySelector('#authErrorMsg');
      if (errBox) {
        errBox.textContent = msg;
        errBox.classList.remove('hidden');
      }
    }
  }

  update();
}

export function setupAuthModal(router) {
  let modalOverlay = document.getElementById('authModalOverlay');
  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.id = 'authModalOverlay';
    document.body.appendChild(modalOverlay);
  }

  function open() {
    renderAuthModal(modalOverlay, router, () => {
      window.dispatchEvent(new CustomEvent('doctor:updated', { detail: state.doctor }));
      router.init();
    });
  }

  window.addEventListener('auth:required', open);
  return { open };
}
