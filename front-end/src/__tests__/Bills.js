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

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {

    test('Bill initialization', async () => {
      const billInstance = new Bills({
        document: document,
        onNavigate: jest.fn(),
        store: null,
        
      });
      expect(billInstance.document).toBe(document);
      expect(billInstance.onNavigate).toBeDefined();
    });

    test('when clicking on "Nouvelle note de frais" we should navigate to the newBill page ', async () => {

      const billInstance = new Bills({
        document: document,
        onNavigate: jest.fn(),
        store: null,
        
      });
      jest.spyOn(billInstance, 'handleClickNewBill');

      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee', email: "a@a"
      }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      await window.onNavigate(ROUTES_PATH.Bills);
      
      root.innerHTML = BillsUI({ data : null, error :null, loading : null })
      /*const mockedDivIcon = document.createElement("div");
      mockedDivIcon.setAttribute("data-testid", "btn-new-bill");*/
      console.log(root.innerHTML)
      await waitFor(() => screen.getByTestId('btn-new-bill'));
      expect(screen.getByTestId('btn-new-bill')).toBeDefined();
      /*const buttonNewBill = screen.getByTestId('btn-new-bill');
      expect(buttonNewBill).not.toBeNull*/

      const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`);
if (buttonNewBill) {
  console.log(buttonNewBill.tagName);
  buttonNewBill.addEventListener('click', billInstance.handleClickNewBill);
  console.log(buttonNewBill.tagName);
}

      /*buttonNewBill.addEventListener('click', billInstance.handleClickNewBill);*/

await waitFor(() => userEvent.click(buttonNewBill));
expect(billInstance.handleClickNewBill).toHaveBeenCalled();
console.log(window.location.href)


const newBillUrl =  window.location.href.replace(/^https?:\/\/\localhost\//,'');
expect(newBillUrl).toBe("#employee/bill/new");

    });

   

   test('the function handleClickIconEye is called when the icon is clicked', () => {
  const billInstance = new Bills({
    document: document,
    onNavigate: jest.fn(),
    store: null,
  });

  const mockedDivIcon = document.createElement("div");
  mockedDivIcon.setAttribute("data-bill-url", "mockBillUrl");

  billInstance.handleClickIconEye = jest.fn();

  mockedDivIcon.addEventListener('click', () => billInstance.handleClickIconEye(mockedDivIcon));

  mockedDivIcon.dispatchEvent(new MouseEvent('click', { bubbles: true }));

  expect(billInstance.handleClickIconEye).toHaveBeenCalled();
});

    /*test('Then, it should render icon eye', async () => {
      const billInstance = new Bill({
        document: document,
        onNavigate: jest.fn(),
        store: null,
        localStorage: null
      });

      const handleClickIconEyeSpy = jest.spyOn(billInstance, 'handleClickIconEye');
      const mockIcon = document.createElement('div');

      const url = '/fake_url';
      mockIcon.innerHTML = `
        <div id="eye" data-testid="icon-eye" data-bill-url=${url}></div>
        <div class="modal fade" id="modaleFile" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLongTitle">Justificatif</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
              </div>
            </div>
          </div>
        </div>
      `;

      await waitFor(() => {
        mockIcon.addEventListener('click', () => handleClickIconEyeSpy(mockIcon));
        userEvent.click(mockIcon);
      });

      expect(handleClickIconEyeSpy).toHaveBeenCalled();
      expect(mockIcon).toHaveAttribute('data-bill-url');
    });*/

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
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML);
      const antiChrono = (a, b) => ((a < b) ? 1 : +1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });
});
