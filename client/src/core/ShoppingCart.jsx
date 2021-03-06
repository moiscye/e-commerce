import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import {
  Grid,
  Container,
  Header,
  Button,
  Input,
  Message,
  Form,
  Segment,
  Accordion
} from "semantic-ui-react";
import styled from "styled-components";

/**Custom imports */

import Layout from "../layout/Layout";
import CheckoutCard from "./CheckoutCard";
import { UPDATE_ADDRESS, RESET_FLAGS } from "../store/actions/authAction";

/**
 * Styling elements with styled-components
 * Semantic UI modified elements' name will end with 'UI'
 */
const GridColumnUI = styled(Grid.Column)`
  margin-bottom: 1rem !important;
`;

const ShoppingCart = props => {
  const dispatch = useDispatch();
  const { user, token, address: storedAddress, cart: items } = useSelector(state => ({
    ...state.authReducer,
    ...state.cartReducer
  }));

  const [activeIndex, setActiveIndex] = useState(0);
  const [hasAddress, sethasAddress] = useState(false);
  const [address, setAddress] = useState({
    error: false,
    street: "",
    city: "",
    state: "",
    zip: "",
    country: ""
  });

  useEffect(() => {
    if (storedAddress) {
      setAddress({ ...address, ...storedAddress, error: false });
      sethasAddress(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      resetFlags();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const resetFlags = () => {
    dispatch({
      type: RESET_FLAGS
    });
  };

  const isAuthenticated = () => {
    if (user && token) return true;
    else return false;
  };

  const calculateTotal = () => {
    if (items.length > 0) {
      const total = items.reduce((sum, item) => {
        let subtotal = parseFloat(item.price) * parseInt(item.count);
        sum += subtotal;
        return sum;
      }, 0);
      return total;
    }
  };

  const isAddressRequired = () => {
    return items.reduce((needShipping, item) => {
      if (item.shipping) needShipping = true;
      return needShipping;
    }, false);
  };

  const validateForm = () => {
    return address.street && address.city && address.state && address.zip && address.country;
  };

  const handleSubmit = async () => {
    if (!isAddressRequired() || hasAddress) {
      props.history.push("/payment");
      return;
    }
  };

  const updateUserAddress = newAddress => {
    dispatch({
      type: UPDATE_ADDRESS,
      payload: {
        address: newAddress,
        userId: user._id,
        token
      }
    });
  };

  const saveAddress = async () => {
    if (validateForm()) {
      //save address to back end
      const { error, ...newAddress } = address;
      //handle errors here
      console.log(newAddress);

      updateUserAddress(newAddress);
      sethasAddress(true);

      //  props.history.push("/payment");
    } else {
      setAddress({ ...address, error: true });
    }
  };

  const formatPrice = (priceToFormat = 0) => {
    let newPrice = priceToFormat.toFixed(2).toString();
    let decimalPart = newPrice.substring(newPrice.indexOf("."));
    newPrice = newPrice.substring(0, newPrice.indexOf("."));
    return (
      <span>
        {newPrice}
        <sup style={{ fontSize: 14 }}>{decimalPart}</sup>
      </span>
    );
  };

  const handleClick = (e, titleProps) => {
    const { index } = titleProps;
    const newIndex = activeIndex === index ? -1 : index;
    setActiveIndex(newIndex);
  };

  const showCartItems = () => {
    return items.map(product => <CheckoutCard key={product._id} product={product} />);
  };

  const showError = () => (
    <Message color="red" style={{ display: address.error ? "" : "none" }}>
      Please Enter a valid address
    </Message>
  );
  const showEmptyCartMessage = () => (
    <Message color="blue" style={{ display: items.length <= 0 ? "" : "none" }}>
      <Header as="h1">Your cart is empty</Header>
      <Button style={{ marginTop: "1rem" }} as={Link} to="/shop" color="teal" size="large">
        Click here to continue shopping
      </Button>
    </Message>
  );

  const handleChange = (event, { name, value }) => {
    setAddress({ ...address, error: false, [name]: value });
  };

  const buildAddress = ({ street, city, state, zip, country }) => {
    return <p>{`${street} ${city} ${state} ${zip} ${country}`}</p>;
  };

  const addressForm = () => (
    <Form>
      <Segment stacked>
        <Form.Input
          fluid
          type="text"
          placeholder="Street"
          name="street"
          value={address.street}
          onChange={handleChange}
        />
        <Form.Input
          fluid
          placeholder="City"
          type="text"
          name="city"
          value={address.city}
          onChange={handleChange}
        />
        <Form.Input
          fluid
          type="text"
          placeholder="State"
          name="state"
          value={address.state}
          onChange={handleChange}
        />
        <Form.Input
          fluid
          placeholder="Zip/Post Code"
          type="text"
          name="zip"
          value={address.zip}
          onChange={handleChange}
        />
        <Form.Input
          fluid
          placeholder="Country"
          type="text"
          name="country"
          value={address.country}
          onChange={handleChange}
        />

        <Button fluid color="blue" onClick={saveAddress} content="Save Address" />
      </Segment>
    </Form>
  );

  const showAddressSection = () =>
    isAddressRequired() && (
      <GridColumnUI>
        {showError()}
        <Header as="h3" style={{ marginTop: "1rem" }}>
          Delivery Address:
        </Header>
        {hasAddress ? buildAddress(address) : addressForm()}
        <Button
          style={{ display: hasAddress ? "" : "none", marginBottom: "1rem" }}
          color="blue"
          fluid
          onClick={() => sethasAddress(false)}
          content="Change Address"
        />
      </GridColumnUI>
    );

  const showLoginButton = () => (
    <Button fluid color="red" as={Link} to="/signin">
      Sign In to Checkout
    </Button>
  );

  const showTotalSection = () => {
    return (
      <Grid columns="one">
        <Grid.Row>
          <GridColumnUI>
            <Header as="h3">Total:</Header>
          </GridColumnUI>

          <GridColumnUI>
            <Header as="h2"> AU${formatPrice(calculateTotal())}</Header>
          </GridColumnUI>
          <GridColumnUI>
            <Header
              as="h2"
              style={{
                textDecoration: "line-through",
                color: "#c7c7c9"
              }}
            >
              {" "}
              AU${formatPrice(calculateTotal() * 2.4)}
            </Header>
          </GridColumnUI>

          <GridColumnUI>
            <Button fluid color="red" onClick={handleSubmit} content="Checkout" />
          </GridColumnUI>
          <GridColumnUI>
            <Input
              fluid
              label={{ content: "Apply", color: "red" }}
              labelPosition="right"
              placeholder="Enter coupon"
            />
          </GridColumnUI>
          {showAddressSection()}
        </Grid.Row>
      </Grid>
    );
  };

  return (
    <Layout title="Shopping Cart" description="Manage all your items here!">
      <Container style={{ marginTop: "1rem" }}>
        {items.length <= 0 ? (
          showEmptyCartMessage()
        ) : (
          <Grid reversed="computer">
            <Grid.Row>
              <Grid.Column mobile={16} tablet={16} computer={4}>
                {isAuthenticated() ? showTotalSection() : showLoginButton()}
              </Grid.Column>
              <Grid.Column mobile={16} tablet={16} computer={12}>
                <Accordion fluid>
                  <Accordion.Title active={activeIndex === 0} index={0} onClick={handleClick}>
                    <Header
                      as="h2"
                      icon={activeIndex !== 0 ? "angle right" : "angle down"}
                      content={activeIndex !== 0 ? "Show Cart Items" : "Hide Cart Items"}
                    />
                  </Accordion.Title>
                  <Accordion.Content active={activeIndex === 0}>
                    {showCartItems()}
                  </Accordion.Content>
                </Accordion>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        )}
      </Container>
    </Layout>
  );
};

export default ShoppingCart;
