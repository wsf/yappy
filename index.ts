import express, { Request, Response } from "express";
import axios, { AxiosResponse } from 'axios';

import cors from "cors";
import * as yappy from "yappy-node-back-sdk";
import dotenv from "dotenv";

import {
  PagosBgUrlBody,
  PaymentInfo,
  ValidatorParams,
} from "yappy-node-back-sdk/dist/types/common/main";

const app: express.Application = express();

app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

dotenv.config();

const yappyClient = yappy.createClient(
  process.env.MERCHANT_ID!,
  process.env.SECRET_KEY!
);



app.get(
  "/pagosbgurl",
  async (req: Request<any, any, PagosBgUrlBody, any>, res: Response) => {
    //const response = await yappyClient.getPaymentUrl(req.body, false, true); // modo pruebas
    const response = await yappyClient.getPaymentUrl(req.body); // modo produccion
    if (!response.success) {
      res.status(500).send(response); 
    } else {
      res.send(response);   
    }        
  }
);


app.get(
  "/api/pagosbg",
  (req: Request<any, any, any, ValidatorParams>, res: Response) => {
    const success = yappyClient.validateHash(req.query);
    console.log('entra a pagosbg');
    console.log(success);
    if (success) {
      
      const { orderId, status, hash } = req.query;

      const url = 'http://localhost:8017/api/check_status';
      const data = {
        "jsonrpc": "2.0",
        "params": {
                  "orderId": "53",
                  "status": "E",
                  "Hash": "b224af1507bb1cd66058c1290a3b410566e50968c13b02fc78423d6671da66b6"
                  }
        }


      let body= JSON.stringify(data)


      try {
        const response = axios.request({
          method: 'POST',
          url: url,
          headers: {
            'Content-Type': 'application/JSON'
          },
          data: body,
        
        })
        return response;
    
      } catch (error) {
        if (axios.isAxiosError(error)) {
          // Manejo de errores específico de Axios
          console.error('Error en la petición:', error.message);
          throw error;
        } else {
          // Manejo de otros tipos de errores
          console.error('Error inesperado:', error);
          throw error;
        }
      }



    }
  }
);


const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Listening on port ${port}`));