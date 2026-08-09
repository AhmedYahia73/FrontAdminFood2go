import { Cart } from '../../../../../Components/Components'
import { CanceledIcon, ConfirmedIcon, DeliveredIcon, FailedToDeliverIcon, OutForDeliveryIcon, PendingIcon, ReturnedIcon, ProcessingIcon } from '../../../../../Assets/Icons/AllIcons'
import { RiRefund2Line } from "react-icons/ri";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../../../Context/Auth";

const CartsOrderSection = ({ ordersNum }) => {
  const { t, i18n } = useTranslation();
  const auth = useAuth();
  const role = auth.userState?.role ? auth.userState?.role : localStorage.getItem("role");

  const route = role === "branch" ? "/branch/orders" : "/dashboard/orders";
  return (
    <>
      <div className="flex flex-wrap items-start justify-center w-full gap-4 mt-4 sm:flex-col lg:flex-row">
        <Cart
          route={route + "/pending"}
          icon={<PendingIcon />}
          title={t('Pending')}
          count={ordersNum.ordersPending || 0}
        />
        <Cart
          route={route + '/confirmed'}
          icon={<ProcessingIcon />}
          title={t('Accept')}
          count={ordersNum.ordersProcessing || 0}
        />
        <Cart
          route={route + '/processing'}
          icon={<ConfirmedIcon />}
          title={t('Processing')}
          count={ordersNum.ordersConfirmed || 0}
        />
        <Cart
          route={route + '/out_for_delivery'}
          icon={<OutForDeliveryIcon />}
          title={t('OutForDelivery')}
          count={ordersNum.ordersOutForDelivery || 0}
        />
        <Cart
          route={route + '/delivered'}
          icon={<DeliveredIcon />}
          title={t('Delivered')}
          count={ordersNum.ordersDelivered || 0}
        />
        <Cart
          route={route + '/canceled'}
          icon={<CanceledIcon />}
          title={t('Canceled')}
          count={ordersNum.ordersCanceled || 0}
        />
        <Cart
          route={route + '/returned'}
          icon={<ReturnedIcon />}
          title={t('Returned')}
          count={ordersNum.ordersReturned || 0}
        />
        <Cart
          route={route + '/refund'}
          icon={<RiRefund2Line className='text-4xl text-mainColor' />}
          title={t('Refund')}
          count={ordersNum.ordersRefund || 0}
        />
        <Cart
          route={route + '/failed'}
          icon={<FailedToDeliverIcon />}
          title={t('FailedToDeliver')}
          count={ordersNum.ordersFailed || 0}
        />
      </div>
    </>
  )
}

export default CartsOrderSection