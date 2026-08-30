import { Navbar } from '/components/navbar/navbar.js';

const navbarRoot =
    document.getElementById('navbar');

if (!navbarRoot) {
    throw new Error(
        'Navbar root element not found.'
    );
}

const navbar =
    new Navbar(navbarRoot, {
        authenticated: false
    });

navbar.render();


const registrationForm =
    document.getElementById(
        'registrationForm'
    );

const registrationMessage =
    document.getElementById(
        'registrationMessage'
    );


registrationForm.addEventListener(
    'submit',
    async (event) => {

        event.preventDefault();

        registrationMessage.hidden = true;


        const formData =
            new FormData(registrationForm);


        const password =
            formData.get('password');

        const passwordConfirmation =
            formData.get(
                'passwordConfirmation'
            );


        if (
            password !==
            passwordConfirmation
        ) {
            registrationMessage.textContent =
                'Пароли не совпадают.';

            registrationMessage.hidden = false;

            return;
        }


        const preferredDays =
            formData
                .getAll('preferredDays')
                .map(Number);


        const request = {
            nickname:
                formData.get('nickname'),

            password,

            email:
                formData.get('email'),

            firstName:
                formData.get('firstName'),

            lastName:
                formData.get('lastName'),

            birthDate:
                formData.get('birthDate'),

            gender:
                formData.get('gender'),

            height:
                Number(formData.get('height')),

            weight:
                Number(formData.get('weight')),

            preferredWorkoutTime:
                formData.get(
                    'preferredWorkoutTime'
                ),

            preferredDays,

            experienceLevel:
                formData.get(
                    'experienceLevel'
                ),

            fitnessGoal:
                formData.get(
                    'fitnessGoal'
                )
        };


        try {

            const response =
                await fetch(
                    '/api/auth/register',
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body:
                            JSON.stringify(
                                request
                            )
                    }
                );


            const result =
                await response.json();


            if (!response.ok) {
                throw new Error(
                    result.message ??
                    'Не удалось создать аккаунт.'
                );
            }


            localStorage.setItem(
                'accessToken',
                result.accessToken
            );

            localStorage.setItem(
                'refreshToken',
                result.refreshToken
            );


            window.location.href =
                '/user/dashboard/dashboard.html';

        } catch (error) {

            registrationMessage.textContent =
                error instanceof Error
                    ? error.message
                    : 'Произошла ошибка при регистрации.';

            registrationMessage.hidden = false;
        }
    }
);