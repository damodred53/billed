/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { screen, waitFor, getByTestId } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js"
import Bills from '../containers/Bills';
import Bill from '../containers/Bills';
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import Actions from "../views/Actions.js";
import { ROUTES } from "../constants/routes.js";
import { modal } from "../views/BillsUI.js";
import router from "../app/Router.js";
import { fireEvent } from '@testing-library/user-event';
import mockedStore from "../__mocks__/store";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {


    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId('icon-window'));
      const windowIcon = screen.getByTestId('icon-window');
      
      // to-do write expect expression
      expect(windowIcon).toHaveClass('active-icon');
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })




    test('Bill initialization', async () => {
      const billInstance = new Bills({
        document: document,
        onNavigate: jest.fn(),
        store: null,
      });
      expect(billInstance.document).toBe(document);
      expect(billInstance.onNavigate).toBeDefined();
    });

    test("By clicking on the eye-icon, a modal should open", async () => {
      
      jest.mock("../app/store", () => mockedStore);


      const onNavigate = pathname => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });

      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const billsPage = new Bills({
        document,
        onNavigate,
        store: mockedStore,
        localStorage: window.localStorage,
      });

      document.body.innerHTML = BillsUI({ data: bills });

      const iconEyes = screen.getAllByTestId("icon-eye");

      const handleClickIconEye = jest.fn(billsPage.handleClickIconEye);

      const modale = document.getElementById("modaleFile");

      $.fn.modal = jest.fn(() => modale.classList.add("show")); 

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
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = BillsUI({ data : null, error :null, loading : null })
      const billInstance = new Bills({
        document: document,
        onNavigate: onNavigate,
        store: null,
      });
      const handleClick = jest.fn(billInstance.handleClickNewBill)

      await waitFor(() => screen.getByTestId('btn-new-bill'));
      const buttonNewBill = screen.getByTestId('btn-new-bill');
      buttonNewBill.addEventListener('click', handleClick())
      userEvent.click(buttonNewBill)
      expect(handleClick).toHaveBeenCalled()
      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
    
    });

    test("should fetch bills from mock API GET", async () => {
      jest.mock("../app/store", () => mockedStore);


      const onNavigate = pathname => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });

      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const billsInstance = new Bills({
        document,
        onNavigate,
        store: mockedStore,
        localStorage: window.localStorage,
      });

      document.body.innerHTML = BillsUI({ data: bills });

      await billsInstance.getBills();

      const iconEyes = screen.getAllByTestId("icon-eye");
      expect(iconEyes).toBeTruthy()
      const tbody = screen.getByTestId("tbody");
      expect(tbody).toBeTruthy()

    })


  });
});
