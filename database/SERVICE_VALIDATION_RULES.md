# Règles de validation transactionnelle

Ces règles doivent être appliquées dans la future couche service Node.js, dans une transaction SQL unique. Elles ne sont pas mises en triggers afin d'éviter une logique métier complexe et difficile à maintenir dans MySQL.

## Finance

- Une transaction `income` doit utiliser une catégorie `income`; une transaction `expense` une catégorie `expense`.
- Une transaction `transfer_in` ou `transfer_out` ne doit jamais avoir de catégorie.
- Chaque transfert crée exactement deux écritures du même montant et de la même date : `transfer_out` sur `from_account_id` et `transfer_in` sur `to_account_id`. Les écritures doivent avoir `source_module = 'finance'` et ne doivent être ni des revenus ni des dépenses.
- Chaque écriture liée à un objet métier doit porter le bon `source_module`, le bon type/source identifiant, le même montant, la même date métier et un sens compatible : revenus pour facture, récolte et vente animale; dépenses pour les dépenses et coûts.
- Un paiement de facture doit référencer une transaction `income`; son montant doit être identique à celui de la transaction. La somme des paiements ne peut pas dépasser `invoices.total_amount`. Le statut et `paid_date` de la facture sont calculés à partir de ces paiements.
- Le `subtotal` d'un devis doit être recalculé depuis les lignes; `tax_amount` et le total doivent être calculés côté service. Les totaux de facture doivent être calculés côté service depuis ses règles de facturation.
- Une catégorie parente et son enfant doivent partager le même `category_type`; une catégorie ne peut pas être son propre parent ni être l'un de ses descendants.

## Transport

- Avant de créer ou modifier une affectation active, rechercher sous verrou les affectations non annulées qui chevauchent l'intervalle du même véhicule ou du même chauffeur. Une affectation ouverte (`ends_at IS NULL`) chevauche toute affectation postérieure.

## Élevage

- Dans une reproduction, l'animal `female_animal_id` doit être de sexe `female`, l'animal mâle éventuel de sexe `male`, et les deux doivent être de la même espèce.
- Une acquisition animale liée à une transaction doit correspondre à une transaction `expense`, de module `livestock`, pour le même montant et la même date.
