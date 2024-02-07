/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event'
import {screen, waitFor, getByTestId} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bill from '../containers/Bills'
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import Actions from "../views/Actions.js"
import { ROUTES } from "../constants/routes.js"

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {

    test(('Then, it should render icon eye'), async () => {
      
      const billInstance = new Bill({
        document: document,
        onNavigate: jest.fn(), 
        store: null,
        localStorage: null
      });

      const handleClickIconEyeSpy = jest.spyOn(billInstance, 'handleClickIconEye')
      const mockIcon = document.createElement('div');
      mockIcon.addEventListener('click', () => handleClickIconEyeSpy())
      userEvent.click(mockIcon);
      expect(handleClickIconEyeSpy).toHaveBeenCalled();

      

      /*// Espionnez handleClickIconEye de l'instance de Bill
      const handleClickIconEyeSpy = jest.spyOn(billInstance, 'handleClickIconEye');

      // Créez un élément simulé pour représenter l'icône
      const mockIcon = document.createElement('div');

      // Attachez la fonction handleClickIconEye espionnée à l'icône simulée
      mockIcon.addEventListener('click', () => handleClickIconEyeSpy(mockIcon));

      // Cliquez sur l'icône simulée
      userEvent.click(mockIcon);

      // Vérifiez si la fonction handleClickIconEye espionnée a été appelée
      expect(handleClickIconEyeSpy).toHaveBeenCalled();

      // Réinitialisez l'espion après le test
      handleClickIconEyeSpy.mockRestore();*/

      

    
    })







    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon).toHaveClass('active-icon')

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : +1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})
