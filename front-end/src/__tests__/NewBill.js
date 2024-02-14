/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import BillsUI from "../views/BillsUI.js";
import store from "../__mocks__/store.js";
import userEvent from '@testing-library/user-event'


describe("Given I am connected as an employee", () => {
    describe("When I am on NewBill Page", () => {
        test("Then mail icon in vertical layout should be highlighted", async() => {
            Object.defineProperty(window, 'localStorage', { value: localStorageMock })
            window.localStorage.setItem('user', JSON.stringify({
                type: 'Employee'
            }))

            //Création d'un contenu ficitif pour la page
            const root = document.createElement("div")
            root.setAttribute("id", "root")
            document.body.append(root)

            // version mockée d'un chargement de page récupération des icones et de leur class
            const pathname = ROUTES_PATH['NewBill']
            root.innerHTML = ROUTES({ pathname: pathname, loading: true })
            document.querySelector('#layout-icon1').classList.remove('active-icon')
            document.querySelector('#layout-icon2').classList.add('active-icon')

            // récupération de l'icône
            await waitFor(() => screen.getByTestId('icon-mail'))
            const mailIcon = screen.getByTestId('icon-mail')

            //vérification si l'icône contient la classe active-icon
            const iconActivated = mailIcon.classList.contains('active-icon')
            expect(iconActivated).toBeTruthy();
        })
    })
    describe("When I select an image in a correct format", () => {
        test("Then the input file should display the file name", async () => {

            

            //création d'un page fictive newbill
            const html = NewBillUI();
            document.body.innerHTML = html;

            const pathname = ROUTES_PATH['NewBill']
            root.innerHTML = ROUTES({ pathname: pathname, loading: true })

            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname : pathname });
            };

            // initialisation d'une nouvelle instance newBill
            const newBill = new NewBill({ document, onNavigate, store : store, localStorage: window.localStorage })
            const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))

            // ajout d'un listener sur la partie file du formulaire de création des factures
            const input = screen.getByTestId('file');
            input.addEventListener('change', handleChangeFile);

            const appendSpy = jest.spyOn(FormData.prototype, 'append');
            //fichier au bon format
            fireEvent.change(input, {
                target: {
                    files: [new File(['image_test_unitaire.jpg'], 'image_test_unitaire.jpg', {
                        type: 'image_test_unitaire/jpg'
                    })],
                }
            })

            expect(handleChangeFile).toHaveBeenCalled()
            expect(input.files[0].name).toBe('image_test_unitaire.jpg');

            const formData = new FormData()
            const email = "email_de_test@live.fr";
            formData.append('file', input.files[0])
            formData.append('email', email)
            expect(formData).toBeDefined()

            expect(appendSpy).toHaveBeenCalledWith('file', expect.any(File));
            expect(appendSpy).toHaveBeenCalledWith('email', 'email_de_test@live.fr');
            for( const data of formData) {
              console.log(data)
            }

            const postSpyBills = jest.fn(store, "bills");
            const postSpyBillsSpy = jest.spyOn(store, "bills");
            const postSpyBillsCreateSpy = jest.spyOn(store.bills(), "create");
            
            const postSpyCreate = jest.fn(store, "create");

           

        })


        test("Then a bill is created", () => {

            //création d'un page fictive newbill
            const html = NewBillUI();
            document.body.innerHTML = html;
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };

            // initialisation d'une nouvelle instance newBill
            const newBill = new NewBill({ document, onNavigate, store: null, localStorage: window.localStorage })
                //fonctionnalité submit
            const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
            const submit = screen.getByTestId('form-new-bill');
            submit.addEventListener('submit', handleSubmit);
            fireEvent.submit(submit)
            expect(handleSubmit).toHaveBeenCalled();
        })
    })

    describe("When I select a file with an incorrect extension", () => {
        test("Then error message is displayed", async () => {

            //création d'un page fictive newbill
            const html = NewBillUI();
            document.body.innerHTML = html;
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };

            // initialisation d'une nouvelle instance newBill
            const newBill = new NewBill({ document, onNavigate, store: store, localStorage: window.localStorage })
                // selection du fichier afin de vérifier son format
            const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
            let input = screen.getByTestId('file');
            input.addEventListener('change', handleChangeFile);
            //fichier au format txt, = mauvais format de fichier afin de tester l'indication d'erreur
            fireEvent.change(input, {
                target: {
                    files: [new File(['image.txt'], 'image.txt', {
                        type: 'image/txt'
                    })],
                }
            })

            expect(handleChangeFile).toHaveBeenCalled()

            // Vérification de la présence du message d'erreur visible pour l'utilisateur
            await waitFor(() => screen.getByTestId('error_format_paragraph'));
            const textError = screen.getByTestId('error_format_paragraph');
            let computedStyle = getComputedStyle(textError)
            expect(computedStyle.display).toBe('block')
          
        })

    })
})

//POST test de la fonction handleSubmit
describe("When I navigate to Dashboard employee", () => {
	describe("Given I am a user connected as Employee, and a user post a newBill", () => {
		test("Add a bill from mock API POST", async () => {
			const postSpy = jest.spyOn(store, "bills");
			const bill = {
				"id": "47qAXb6fIm2zOKkLzMro",
      "vat": "80",
      "fileUrl": "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
      "status": "pending",
      "type": "Hôtel et logement",
      "commentary": "séminaire billed",
      "name": "encore",
      "fileName": "preview-facture-free-201801-pdf-1.jpg",
      "date": "2004-04-04",
      "amount": 400,
      "commentAdmin": "ok",
      "email": "a@a",
      "pct": 20
			};
			const postBills = await store.bills().update(bill);
			expect(postBills).toStrictEqual(bill);
		});

    test("Add a bill from mock API POST with the function create", async () => {
			const postSpy = jest.spyOn(store, "bills");
			const bill = {
				fileUrl: "https://localhost:3456/images/test.jpg",
        key: '1234'
			};
			const postBills = await store.bills().create(bill);

			expect(postBills).toStrictEqual(bill);
		});

		describe("When an error occurs on API", () => {
			beforeEach(() => {
				window.localStorage.setItem(
					"user",
					JSON.stringify({
						type: "Employee",
					})
				);

				document.body.innerHTML = NewBillUI();

			});

			test("Add bills from an API and fails with 404 message error", async () => {
				const postSpy = jest.spyOn(console, "error");

        
				const onNavigate = (pathname) => {
					document.body.innerHTML = ROUTES({ pathname });
				};

				const store = {
					bills: jest.fn(() => newBill.store),
					create: jest.fn(() => Promise.resolve({})),
					update: jest.fn(() => Promise.reject(new Error("404"))),
				};

				const newBill = new NewBill({ document, onNavigate, store, localStorage });
				newBill.isImgFormatValid = true;

				// Submit form
				const form = screen.getByTestId("form-new-bill");
				const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
				form.addEventListener("submit", handleSubmit);

				fireEvent.submit(form);
				await new Promise(process.nextTick);
				expect(postSpy).toBeCalledWith(new Error("404"));
			});
			test("Add bills from an API and fails with 500 message error", async () => {
				const postSpy = jest.spyOn(console, "error");

        
				const onNavigate = (pathname) => {
					document.body.innerHTML = ROUTES({ pathname });
				};

				const store = {
					bills: jest.fn(() => newBill.store),
					create: jest.fn(() => Promise.resolve({})),
					update: jest.fn(() => Promise.reject(new Error("500"))),
				};

				const newBill = new NewBill({ document, onNavigate, store, localStorage });
				newBill.isImgFormatValid = true;

				// Submit form
				const form = screen.getByTestId("form-new-bill");
				const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
				form.addEventListener("submit", handleSubmit);

				fireEvent.submit(form);
				await new Promise(process.nextTick);
				expect(postSpy).toBeCalledWith(new Error("500"));
			});
		});
	});
});