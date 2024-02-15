/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { screen, waitFor, getByTestId } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js"
import Bills from '../containers/Bills';
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES } from "../constants/routes.js";
import router from "../app/Router.js";
import mockedStore from "../__mocks__/store";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {

    test("Then bill icon in vertical layout should be highlighted", async () => {

      // création d'un nouveau localstorage dans le navigateur pour les tests
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));

      // création d'une div et intégration dans la page pour les tests
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);

      router();

      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId('icon-window'));
      const windowIcon = screen.getByTestId('icon-window');
      
      // vérification de la classe "active-icon" sur icon-window
      expect(windowIcon).toHaveClass('active-icon');
    });

    // test à modifier pour les besoins du projet
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    test("By clicking on the eye-icon, a modal should open", async () => {
      
      // appel du faux storage contenant des factures spécialement conçues pour les tests
      jest.mock("../app/store", () => mockedStore);

      const onNavigate = pathname => {
        document.body.innerHTML = ROUTES({ pathname });
      };

       // création d'un nouveau localstorage dans le navigateur pour les tests
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });

      //Création d'un employee stocké dans le faux storage pour les tests
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
        // Création d'une nouvelle instance de Bills
      const billsPage = new Bills({
        document,
        onNavigate,
        store: mockedStore,
        localStorage: window.localStorage,
      });

      // Création de la page BillsUI sur le navigateur
      document.body.innerHTML = BillsUI({ data: bills });

      // Récupération de l'ensemble des icones d'oeil
      const iconEyes = screen.getAllByTestId("icon-eye");

      // Création d'une version mockée de la fonction gérant le click sur l'icone d'oeil
      const handleClickIconEye = jest.fn(billsPage.handleClickIconEye);

      // Récupération de la modale dans le DOM
      const modale = document.getElementById("modaleFile");
      $.fn.modal = jest.fn(() => modale.classList.add("show")); 

      // Application d'une listener sur chaque icone d'oeil et activation de celui-ci
      iconEyes.forEach(iconEye => {
        iconEye.addEventListener("click", () => handleClickIconEye(iconEye));
        userEvent.click(iconEye);

        expect(handleClickIconEye).toHaveBeenCalled();
        expect(modale).toHaveClass("show");
      });
    
  });

    test('when clicking on "Nouvelle note de frais" we should navigate to the newBill page ', async () => {

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      // création d'un nouveau localstorage dans le navigateur pour les tests
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      // Création de la page BillsUI sur le navigateur servant de point de départ pour le test
      document.body.innerHTML = BillsUI({ data : null, error :null, loading : null })
      
      // Création d'une nouvelle instance de Bills
      const billInstance = new Bills({
        document: document,
        onNavigate: onNavigate,
        store: null,
      });

      // Création d'une version mockée de la fonction gérant le click pour naviguer vers la page newBill
      const handleClick = jest.fn(billInstance.handleClickNewBill)

      // Récupération du bouton permettant de naviguer vers newBill
      await waitFor(() => screen.getByTestId('btn-new-bill'));
      const buttonNewBill = screen.getByTestId('btn-new-bill');

      // Application d'une listener sur le bouton et activation de celui-ci
      buttonNewBill.addEventListener('click', handleClick())
      userEvent.click(buttonNewBill)
      expect(handleClick).toHaveBeenCalled()
      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
    
    });

    test("should fetch bills from mock API GET", async () => {

      // appel du faux storage contenant des factures spécialement conçues pour les tests
      jest.mock("../app/store", () => mockedStore);

      const onNavigate = pathname => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // création d'un nouveau localstorage dans le navigateur pour les tests
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });

      //Création d'un employee stocké dans le faux storage pour les tests
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      // Création d'une nouvelle instance de Bills
      const billsInstance = new Bills({
        document,
        onNavigate,
        store: mockedStore,
        localStorage: window.localStorage,
      });

      // Création de la page BillsUI sur le navigateur
      document.body.innerHTML = BillsUI({ data: bills });

      // Surveillance de la fonction mockée getBills
      const handleGetBills = spyOn(billsInstance, "getBills")
      await billsInstance.getBills();
      expect(handleGetBills).toHaveBeenCalled();

      const iconEyes = screen.getAllByTestId("icon-eye");
      expect(iconEyes).toBeTruthy()
      const tbody = screen.getByTestId("tbody");
      expect(tbody).toBeTruthy()

    })
  });
});
