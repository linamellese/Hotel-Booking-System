import { HTTP_STATUS } from "../../../constants/http.js";
import AppError from "../../../utils/AppError.js";
import { successResponse } from "../../../utils/responseFormatter.js";
import { BookingService } from "../../bookings/service/index.js";
import { PaymentService } from "../service/index.js";
import crypto from "crypto";

const secret_hash = process.env.CHAPA_SECRET_HASH;

// Initiate Payment controller
export const initiatePayment = async (req, res, next) => {
   try {
      const user_id = req?.user?.id;
      const { booking_id } = req.body;

      if (!user_id) {
         throw new AppError(
            "Authentication required",
            HTTP_STATUS.UNAUTHORIZED
         );
      }

      const payment = await PaymentService.createPayment(booking_id);

      return successResponse(res, {
         message: "Payment initiated successfully",
         data: payment,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Verify Payment controller
export const verifyPayment = async (req, res, next) => {
   try {
      const { reference } = req.params;

      if (!reference) {
         throw new AppError("Reference is required", HTTP_STATUS.BAD_REQUEST);
      }

      const payment = await PaymentService.verifyPayment(reference);

      return successResponse(res, {
         message: "Payment verified successfully",
         data: payment,
         statusCode: HTTP_STATUS.OK,
      });
   } catch (error) {
      next(error);
   }
};

// Webhook Payment controller
export const webhookPayment = async (req, res, next) => {
   try {
      const event = req?.body;

      if (!event) {
         return res.status(400).send();
      }

      const hash = crypto
         .createHmac("sha256", secret_hash)
         .update(JSON.stringify(event))
         .digest("hex");
      if (hash !== req.headers["x-chapa-signature"]) {
         return res.status(401).send();
      }

      if (event.event) {
         const { currency, status, tx_ref, payment_method } = event;
         // Update payment status
         const payment = await PaymentService.updatePayment({
            transaction_reference: tx_ref,
            status,
            payment_method,
            currency,
         });
         if (!payment) {
            return res.status(500).send();
         }
         // update booking status
         if (status === "success") {
            const booking =
               await BookingService.updateBookingStatusWithBookingReference(
                  tx_ref,
                  "paid"
               );
            if (!booking) {
               return res.status(500).send();
            }
         }

         return res.status(200).send();
      }

      return res.status(404).send();
   } catch (error) {
      next(error);
   }
};
